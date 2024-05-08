const express = require("express");
require("dotenv").config();
const connectToMongoDB = require("./db/connectToMDB.js");
const pool = require("./db");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const { login, signup, logout } = require("./controllers/auth.controller.js");
const { list } = require("./controllers/members.controller.js");
const { createGroup } = require("./controllers/createGroup.controller.js");
const bodyParser = require("body-parser");
const verifyUser = require("./middleware/securityRoute.js");
const {
  createChat,
  fetchchats,
} = require("./controllers/messages.controller.js");
const { create } = require("./models/users.model.js");
const app = express();

app.use(express.json());
// middleware
app.use(
  cors({
    origin: ["http://localhost:3000"],
    methods: ["GET", "POST"],
    credentials: true,
  })
);
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
//socket
// for verify user

app.get("/", verifyUser, (req, res) => {
  res.json({
    Status: "success",
    name: req.user.name,
    email: req.user.email,
    user_id: req.user.user_id,
  });
  // console.log(req.user);
});
//routes
//signup
app.post("/signup", signup);

// login
app.post("/login", login);
// logout
app.get("/logout", logout);

// get list
app.get("/list", verifyUser, list);
// delete user
app.post("/delete", verifyUser, async (req, res) => {
  try {
    const email = req.body.email;
    const result = await pool.query(
      "DELETE FROM users WHERE email = $1 returning *",
      [email]
    );
    return res.status(200).json({ Status: "success", list: result.rows });
  } catch (error) {
    console.log(error);
  }
});

// create oneoneone chat
app.post("/createchat", verifyUser, createChat);

//fetch chats
app.post("/fetchchats", verifyUser, fetchchats);
//delete chat
app.post("/deletechat", verifyUser, async (req, res) => {
  try {
    const chat_id = req.body.chat_id;
    const result = await pool.query(
      "DELETE FROM chats WHERE chat_id = $1 returning *",
      [chat_id]
    );
    return res.status(200).json({ Status: "success", list: result.rows });
  } catch (error) {
    console.log(error);
  }
});
// create group
app.post("/creategroup", verifyUser, createGroup);
//fetch groups

app.delete("/deleteGroup/:groupId", async (req, res) => {
  try {
    const groupId = req.params.groupId;

    // First, delete the group
    const groupDeleteResult = await pool.query(
      "DELETE FROM groups WHERE group_id = $1",
      [groupId]
    );

    if (groupDeleteResult.rowCount === 0) {
      // Check if the group was not found
      return res
        .status(404)
        .json({ Status: "error", message: "Group not found." });
    }

    // Second, delete associated members
    const membersDeleteResult = await pool.query(
      "DELETE FROM members WHERE g_id = $1",
      [groupId]
    );

    return res.status(200).json({
      Status: "success",
      message: "Group and associated members deleted.",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      Status: "error",
      message: "An error occurred while deleting the group.",
    });
  }
});

// add group members
app.post("/addmembers", async (req, res) => {
  try {
    // const user_id = req.user.user_id;
    const group_id = req.body.group_id;
    const newMember_id = req.body.member_id;
    const result = await pool.query(
      "INSERT INTO members (user_id,g_id) VALUES($1,$2) returning *",
      [newMember_id, group_id]
    );
    return res.status(200).json({ Status: "success", list: result.rows });
  } catch (error) {
    console.log(error);
  }
});

//fetch groups members
app.post("/groupmembers", async (req, res) => {
  try {
    const user_id = req.user.user_id;
    const result = await pool.query(
      "SELECT u.name AS user_name, g.g_name FROM users u JOIN members m ON u.user_id = m.user_id JOIN groups g ON m.g_id = g.group_id;"[
        user_id
      ]
    );
    return res.status(200).json({ Status: "success", list: result.rows });
  } catch (error) {
    console.log(error);
  }
});

// listen at 5000
const PORT = process.env.PORT;
const server = app.listen(PORT, () => {
  connectToMongoDB();
  console.log(`Server Running on port ${PORT}`);
});
// console.log(server);
const io = require("socket.io")(server, {
  cors: {
    origin: ["http://localhost:3000"],
    // credentials: true,
  },
});
