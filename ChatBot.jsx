import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import "./ChatBot.css";

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { sender: "bot", text: "👋 Hello! I’m your Smart HealthCare Assistant. First, may I know your name?" }
  ]);
  const [input, setInput] = useState("");
  const [userName, setUserName] = useState("");
  const [step, setStep] = useState(1); // controls onboarding
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const newMessage = { sender: "user", text: input };
    setMessages((prev) => [...prev, newMessage]);

    let botReply = "";

    // Onboarding steps
    if (step === 1) {
      setUserName(input);
      botReply = `Nice to meet you, ${input}! 😊 Please choose one option:\n1️⃣ Platform Queries\n2️⃣ Appointment Queries\n3️⃣ Doctor Related`;
      setStep(2);
    } else if (step === 2) {
      if (input.includes("1")) {
        botReply = "Great! You chose Platform Queries. Ask me anything about how the system works.";
        setStep(3);
      } else if (input.includes("2")) {
        botReply = "Awesome! You chose Appointment Queries. You can ask me about booking, rescheduling, or canceling.";
        setStep(3);
      } else if (input.includes("3")) {
        botReply = "Perfect! You chose Doctor Related Queries. Ask me about doctor availability or profiles.";
        setStep(3);
      } else {
        botReply = "Please choose 1, 2, or 3.";
      }
    } else {
      // After onboarding → connect with backend
      try {
        const res = await axios.post("http://localhost:5000/api/chat", {
          message: userName ? `${input} (User name: ${userName})` : input,
        });
        botReply = res.data.reply;
      } catch (err) {
        botReply = "⚠️ Sorry, I couldn’t connect to the server.";
      }
    }

    const botMessage = { sender: "bot", text: botReply };
    setMessages((prev) => [...prev, botMessage]);
    setInput("");
  };

  return (
    <div className="chatbot-container">
      {/* Floating button */}
      {!isOpen && (
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsOpen(true)}
          className="chatbot-toggle"
        >
          💬 Chat
        </motion.button>
      )}

      {/* Chat window */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          className="chatbot-window"
        >
          {/* Header */}
          <div className="chatbot-header">
            <span>SmartCare ChatBot</span>
            <button onClick={() => setIsOpen(false)}>✖</button>
          </div>

          {/* Messages */}
          <div className="chatbot-messages">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`chatbot-message ${msg.sender}`}
              >
                {msg.text}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="chatbot-input">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Type your message..."
            />
            <button onClick={sendMessage}>➤</button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
