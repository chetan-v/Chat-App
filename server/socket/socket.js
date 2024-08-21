const { Server } = require("socket.io");
const http = require("http");
const express = require("express");
const client = require("../redis/client");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:3000"],
    methods: ["GET", "POST"],
  },
});

var users = [];

io.on("connection", (socket) => {
  socket.on("addUser", (user_id) => {
    const ifExist = users.find((user) => user.user_id === user_id);
    if (!ifExist) {
      const user = { user_id, socket_id: socket.id };
      users.push(user);
      io.emit("getUsers", users);
    }
  });

  socket.on("sendMessage", async ({ sender_id, receiver_id, msg }) => {
    const message = { sender_id, receiver_id, msg };
    const receiver = users.find((user) => user.user_id === receiver_id);

    // Store message in Redis
    // await client.saveMessage(receiver_id, message);

    if (receiver) {
      io.to(receiver.socket_id).emit("getMessage", message);
    }
  });

  // socket.on("fetchMessages", async (user_id) => {
  //   const messages = await client.fetchMessages(user_id);
  //   socket.emit("receiveMessages", messages);
  // });

  socket.on("disconnect", () => {
    users = users.filter((user) => user.socket_id !== socket.id);
    io.emit("getUsers", users);
  });
});

module.exports = {
  server,
  app,
  io,
};
