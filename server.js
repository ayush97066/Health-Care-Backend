const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// In-memory storage for online users and messages
let onlineUsers = {};
let messages = {}; // { chatId: [ {senderId, receiverId, message, status} ] }

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // User joins
  socket.on("join", ({ userId }) => {
    onlineUsers[userId] = socket.id;
    console.log("Online users:", onlineUsers);
  });

  // Sending message
  socket.on("send_message", ({ senderId, receiverId, message }) => {
    const chatId = [senderId, receiverId].sort().join("_");

    if (!messages[chatId]) messages[chatId] = [];

    const msgObj = {
      senderId,
      receiverId,
      message,
      status: onlineUsers[receiverId] ? "Delivered" : "Sent", // Delivered if receiver online
      timestamp: new Date()
    };

    messages[chatId].push(msgObj);

    // Emit to receiver if online
    if (onlineUsers[receiverId]) {
      io.to(onlineUsers[receiverId]).emit("receive_message", msgObj);
    }

    // Echo to sender
    socket.emit("receive_message", msgObj);
  });

  // Message seen
  socket.on("message_seen", ({ senderId, receiverId }) => {
    const chatId = [senderId, receiverId].sort().join("_");
    if (messages[chatId]) {
      messages[chatId].forEach((msg) => {
        if (msg.receiverId === receiverId && msg.status !== "Seen") msg.status = "Seen";
      });

      // Notify sender
      if (onlineUsers[senderId]) {
        io.to(onlineUsers[senderId]).emit("messages_seen", { chatId });
      }
    }
  });

  socket.on("disconnect", () => {
    for (let [userId, id] of Object.entries(onlineUsers)) {
      if (id === socket.id) delete onlineUsers[userId];
    }
    console.log("User disconnected. Online users:", onlineUsers);
  });
});

server.listen(5000, () => console.log("Server running on port 5000"));
