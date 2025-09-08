import express from "express";
import { User } from "../models/schema.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "fallbacksecret";

/**
 * Patient Signup
 */

export const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: "Access denied" });

  const token = authHeader.split(" ")[1]; // Bearer <token>
  if (!token) return res.status(401).json({ message: "Access denied" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // contains { id, role }
    next();
  } catch (err) {
    res.status(401).json({ message: "Invalid token" });
  }
};

router.post("/signup/patient", async (req, res) => {
  try {
    const { name, email, password, age, gender, phone } = req.body;

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: "Email already registered" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      name,
      email,
      password: hashedPassword,
      role: "patient",
      age,
      gender,
      phone,
    });

    await user.save();

    res.status(201).json({
      message: "Patient registered successfully",
      userId: user._id,
      role: user.role,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Doctor Signup
 */
router.post("/signup/doctor", async (req, res) => {
  try {
    const { name, email, password, specialization, phone } = req.body;

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: "Email already registered" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      name,
      email,
      password: hashedPassword,
      role: "doctor",
      specialization,
      phone,
    });

    await user.save();

    res.status(201).json({
      message: "Doctor registered successfully",
      userId: user._id,
      role: user.role,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Patient Login
 */
router.post("/login/patient", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email, role: "patient" });
    if (!user) return res.status(400).json({ message: "Invalid email or password" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid email or password" });

    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: "1h" });

    res.json({
      message: "Patient login successful",
      userId: user._id,
      role: user.role,
      token,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Doctor Login
 */
router.post("/login/doctor", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email, role: "doctor" });
    if (!user) return res.status(400).json({ message: "Invalid email or password" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid email or password" });

    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: "1h" });

    res.json({
      message: "Doctor login successful",
      userId: user._id,
      role: user.role,
      token,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
