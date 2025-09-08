import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import mongoose from "mongoose";

//Import Routes
import videoChatRoutes from "./components/videoChat/videoChat.js";
import chatSystemRoutes from "./components/chatSystem/chatSystem.js";
import authRoutes from "./middleware/auth.js";
import appointmentRoutes from "./routes/appointment.js";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

//MONGODB CONNECTION
mongoose.connect(process.env.MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("MongoDB connected"))
.catch(err => console.error("MongoDB connection error:", err));

// Mount auth and appointment routes
app.use("/api/auth", authRoutes);
app.use("/appointments", appointmentRoutes);
// Mount videoChat routes
app.use("/", videoChatRoutes);
app.use("/", chatSystemRoutes);

// Start server

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`🚀 Agora backend running on port ${PORT}`));
