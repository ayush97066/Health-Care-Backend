import React, { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import "./Chat.css";

const socket = io("http://localhost:5000");

export default function Chat({ userId, receiverId }) {
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    socket.emit("join", { userId });

    socket.on("receive_message", (msg) => {
      setChat((prev) => [...prev, msg]);
    });

    socket.on("messages_seen", ({ chatId }) => {
      setChat((prev) =>
        prev.map((msg) =>
          [msg.senderId, msg.receiverId].sort().join("_") === chatId
            ? { ...msg, status: "Seen" }
            : msg
        )
      );
    });

    return () => {
      socket.off("receive_message");
      socket.off("messages_seen");
    };
  }, [userId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });

    // Mark messages as seen if they are received by current user
    chat
      .filter((msg) => msg.receiverId === userId && msg.status !== "Seen")
      .forEach((msg) => {
        socket.emit("message_seen", { senderId: msg.senderId, receiverId: userId });
      });
  }, [chat, userId]);

  const sendMessage = () => {
    if (!message.trim()) return;
    socket.emit("send_message", { senderId: userId, receiverId, message });
    setMessage("");
  };

  return (
    <div className="chat-container">
      <div className="chat-messages">
        {chat.map((msg, idx) => (
          <div
            key={idx}
            className={`chat-message ${msg.senderId === userId ? "sent" : "received"}`}
          >
            <div className="message-content">
              <span>{msg.message}</span>
              <div className="timestamp">
                {new Date(msg.timestamp).toLocaleTimeString()} | {msg.status}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message..."
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
}
