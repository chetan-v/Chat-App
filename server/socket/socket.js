const { Server } = require("socket.io");
const http = require("http");
const express = require("express");

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
    // console.log(socket.id);
    const ifExist = users.find((user) => user.user_id === user_id);
    if (!ifExist) {
      const user = { user_id, socket_id: socket.id };
      users.push(user);
      io.emit("getUsers", users);
    }

    // console.log(users);
  });
  socket.on("sendMessage", ({ sender_id, receiver_id, msg }) => {
    const receiver = users.find((user) => user.user_id === receiver_id);
    const sender = users.find((user) => user.user_id === sender_id);

    if (receiver) {
      // Emit the message to both the sender and the receiver
      io.to(receiver.socket_id).emit("getMessage", {
        sender_id,
        receiver_id,
        msg,
      });
    }
  });
  socket.on("disconnect", () => {
    // console.log(socket.id + " disconnected");
    users = users.filter((user) => user.socket_id !== socket.id);
    io.emit("getUsers", users);
    // console.log(users+"disconnected");s
  });
});

module.exports = {
  server,
  app,
  io,
};
