import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["doctor", "patient"], required: true },
  specialization: { type: String, required: function() { return this.role === "doctor"; } },
  age: { type: Number, required: function() { return this.role === "patient"; } },
  gender: { type: String, enum: ["Male", "Female", "Other"] },
  phone: { type: String },
}, { timestamps: true });

const appointmentSchema = new mongoose.Schema({
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  date: { type: Date, required: true },
  time: { type: String, required: true },
  status: { type: String, enum: ["pending", "confirmed", "cancelled", "completed"], default: "pending" },
  notes: { type: String },
}, { timestamps: true });

const User = mongoose.model("User", userSchema);
const Appointment = mongoose.model("Appointment", appointmentSchema);

export { User, Appointment };   // ✅ instead of module.exports
