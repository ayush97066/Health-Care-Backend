const express = require("express");
const dotenv = require("dotenv");
const OpenAI = require("openai");
const cors = require("cors");

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Chatbot endpoint
app.post("/api/chat", async (req, res) => {
  try {
    const { message, role } = req.body;

    const systemPrompt = `
You are a helpful AI chatbot for a Smart Health Care Appointment System.
Assist patients with booking, rescheduling, or canceling appointments.
Help doctors manage schedules and availability.
Help admins monitor users and approve doctor registrations.
Always explain step-by-step clearly.
Never provide direct medical diagnosis. Instead, guide users to consult doctors.
`;

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message },
      ],
    });

    res.json({
      reply: response.choices[0].message.content,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Chatbot error" });
  }
});

app.listen(process.env.PORT || 5000, () => {
  console.log(`✅ Chatbot server running on port ${process.env.PORT || 5000}`);
});
