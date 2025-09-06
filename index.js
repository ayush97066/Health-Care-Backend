require("dotenv").config();
const connectDB = require("./config/db");
const User = require("./models/user");

async function run() {
  console.log("🚀 Starting app...");

  await connectDB(); // wait for DB connection

  try {
    const user = new User({
      name: "Ayush",
      age: 23,
      email: "ayush@example.com",
      skills: ["Java", "Spring Boot", "MongoDB"]
    });

    await user.save();
    console.log("✅ User Created:", user);
  } catch (err) {
    console.error("❌ Error:", err.message);
  }

  process.exit(0); // end the process
}

run();
