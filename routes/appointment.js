// routes/appointment.js
import express from "express";
import { Appointment, User } from "../models/schema.js";
import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();

/**
 * Book an Appointment (Patient → Doctor)
 * POST /appointments/book
 * Protected: Only patient can book
 */
router.post("/book", authMiddleware, async (req, res) => {
  try {
    const { doctorId, date, time, notes } = req.body;
    const patientId = req.user.id;

    // Ensure logged-in user is a patient
    const patient = await User.findById(patientId);
    if (!patient || patient.role !== "patient") {
      return res.status(403).json({ message: "Only patients can book appointments" });
    }

    // Check doctor exists
    const doctor = await User.findById(doctorId);
    if (!doctor || doctor.role !== "doctor") {
      return res.status(400).json({ message: "Invalid doctor" });
    }

    // Create appointment
    const appointment = new Appointment({
      doctorId,
      patientId,
      date,
      time,
      notes,
    });

    await appointment.save();
    res.status(201).json({
      message: "Appointment booked successfully",
      appointment,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Get Patient’s Appointments
 * GET /appointments/patient
 * Protected: Only logged-in patient
 */
router.get("/patient", authMiddleware, async (req, res) => {
  try {
    const patientId = req.user.id;
    const patient = await User.findById(patientId);
    if (!patient || patient.role !== "patient") {
      return res.status(403).json({ message: "Access denied" });
    }

    const appointments = await Appointment.find({ patientId })
      .populate("doctorId", "name email specialization")
      .sort({ date: 1, time: 1 });

    res.json({ appointments });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Get Doctor’s Appointments
 * GET /appointments/doctor
 * Protected: Only logged-in doctor
 */
router.get("/doctor", authMiddleware, async (req, res) => {
  try {
    const doctorId = req.user.id;
    const doctor = await User.findById(doctorId);
    if (!doctor || doctor.role !== "doctor") {
      return res.status(403).json({ message: "Access denied" });
    }

    const appointments = await Appointment.find({ doctorId })
      .populate("patientId", "name email age gender")
      .sort({ date: 1, time: 1 });

    res.json({ appointments });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Update Appointment Status
 * PATCH /appointments/:id
 * Protected: Only doctor can update status
 */
router.patch("/:id", authMiddleware, async (req, res) => {
  try {
    const doctorId = req.user.id;
    const doctor = await User.findById(doctorId);
    if (!doctor || doctor.role !== "doctor") {
      return res.status(403).json({ message: "Only doctors can update status" });
    }

    const { status } = req.body;
    if (!["pending", "confirmed", "cancelled", "completed"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const appointment = await Appointment.findOneAndUpdate(
      { _id: req.params.id, doctorId },
      { status },
      { new: true }
    );

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    res.json({ message: "Status updated successfully", appointment });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
