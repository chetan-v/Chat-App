const express = require("express");
require("dotenv").config();
const connectToMongoDB = require("./db/connectToMDB.js");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const verifyUser = require("./middleware/securityRoute.js");
const authRoutes = require("./routes/auth.routes.js");
const userListRoutes = require("./routes/user.routes.js");
const groupListRoutes = require("./routes/group.routes.js");
const chatRoutes = require("./routes/chats.routes.js");
const { app, server } = require("./socket/socket.js");

// Middleware
app.use(express.json());
app.use(
  cors({
    origin: ["http://localhost:3000"],
    methods: ["GET", "POST"],
    credentials: true,
  })
);
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
app.get("/", verifyUser, (req, res) => {
  res.json({
    Status: "success",
    name: req.user.name,
    email: req.user.email,
    user_id: req.user.user_id,
  });
});
app.use("/api/auth", authRoutes);
app.use("/api/user", userListRoutes);
app.use("/api/group", groupListRoutes);
app.use("/api/chats", chatRoutes);

// Deployment
const PORT = process.env.PORT;
server.listen(PORT, () => {
  connectToMongoDB();
  console.log(`Server Running on port ${PORT}`);
});
