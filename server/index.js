import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
const pool = require("pg");
import cors from "cors";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import CryptoJS from "crypto-js";
// const { MongoClient } = require("mongodb");
import socketIO from "socket.io";

const io = socketIO(5001, {
  cors: {
    origin: "http://localhost:3000",
  },
});

dotenv.config();
console.log(process.env.PORT + "h");
const saltRounds = 10;
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

//socket.io
var users = [];
io.on("connection", (socket) => {
  // console.log(socket.id + " connected");
  socket.on("addUser", (user_id) => {
    // console.log(user_id);
    const ifExist = users.find((user) => user.userId === user_id);
    if (!ifExist) {
      const user = { user_id, socket_id: socket.id };
      users.push(user);
      io.emit("getUsers", users);
    }

    // console.log(users);
  });

  socket.on("sendMessage", ({ sender_id, receiver_id, msg }) => {
    const sender = users.find((user) => user.user_id === sender_id);
    const receiver = users.find((user) => user.user_id === receiver_id);
    // console.log(receiver);
    // console.log(sender);
    if (receiver) {
      io.to(receiver.socket_id).to(sender.socket_id).emit("getMessage", {
        receiver: receiver.user_id,
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
//mongodb

// const db = client.db();
// const connectToMongoDB = async () => {
// 	try {
// 		await mongoose.connect(uri);
// 		console.log("Connected to MongoDB");
// 	} catch (error) {
// 		console.log("Error connecting to MongoDB", error.message);
// 	}
// };

// connectToMongoDB();
//routes

app.post("/signup", async (req, res) => {
  try {
    const name = req.body.name;
    const password = req.body.password;
    const email = req.body.email;
    const dob = req.body.dob;
    const gender = req.body.gender;
    try {
      await client.connect();
      console.log("connect to atlas");
    } catch (e) {
      console.log(e);
    }

    const existingUser = await db.collection("users").findOne({ email: email });
    console.log(existingUser);

    if (existingUser) {
      return res.status(409).json({ message: "Email already exists" });
    }

    const hash = bcrypt.hashSync(password, saltRounds);

    const result = await db.collection("users").insertOne({
      name: name,
      password: hash,
      dob: dob,
      gender: gender,
      email: email,
    });

    console.log("Document inserted successfully:", result.insertedId);

    return res.sendStatus(200);
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// for verify user
const verifyUser = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    return res.status(403).json({ message: "token Expired" });
  } else {
    jwt.verify(token, "our-secret-key", (err, decoded) => {
      if (err) {
        return res.status(401).json({ message: "Authentication" });
      } else {
        req.user = {
          name: decoded.name,
          email: decoded.email,
          user_id: decoded._id,
        };
        next();
      }
    });
  }
};
app.get("/", verifyUser, (req, res) => {
  res.json({
    Status: "success",
    name: req.user.name,
    email: req.user.email,
    user_id: req.user.user_id,
  });
  // console.log(req.user);
});
// login
app.post("/login", async (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  try {
    const user = await db.collection("users").findOne({ email: email });

    if (!user) {
      return res.status(401).json({ message: "wrong email" });
    }

    bcrypt.compare(password, user.password, (bcryptErr, bcryptRes) => {
      if (bcryptRes) {
        const { name, email, _id } = user;
        const token = jwt.sign({ name, email, _id }, "our-secret-key", {
          expiresIn: "1h",
        });
        res.cookie("token", token);

        return res.status(200).json({ status: "success" });
      } else {
        return res.status(401).json({ message: "wrong password" });
      }
    });
  } catch (err) {
    console.error("Error finding user:", err);
    return res.status(400).json({ message: "bad request" });
  }
});

// logout
app.get("/logout", (req, res) => {
  res.clearCookie("token");
  return res.status(200).json({ status: "success" });
});

// get list
app.get("/list", verifyUser, async (req, res) => {
  try {
    const users = await db.collection("users").find({}).toArray();
    return res.status(200).json({ Status: "success", list: users });
  } catch (error) {
    console.log(error);
  }
});
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
const secretKey = "kutta";
app.post("/createchat", verifyUser, async (req, res) => {
  try {
    try {
      await client.connect();
      console.log("connect to atlas");
    } catch (e) {
      console.log(e);
    }

    const sender_id = req.user.user_id;
    const receiver_id = req.body.receiver_id;
    const originalMsg = req.body.msg;
    console.log(sender_id, receiver_id, originalMsg);

    // Encrypt the message with the shared secretKey
    const encryptedMsg = CryptoJS.AES.encrypt(
      originalMsg,
      secretKey
    ).toString();
    console.log(encryptedMsg);
    const r = await db.collection("chats").insertOne({
      senderId: sender_id,
      receiverId: receiver_id,
      msg: encryptedMsg,
    });
    console.log(r);
    const result = "";

    return res.status(200).json({ Status: "success", list: r });
  } catch (error) {
    console.log(error);
    res.status(500).json({ Status: "error", message: "Failed to create chat" });
  }
});

//fetch chats
app.post("/fetchchats", verifyUser, async (req, res) => {
  try {
    const sender_id = req.user.user_id;
    const receiver_id = req.body.receiver_id;
    console.log(sender_id, receiver_id);

    const result = await db
      .collection("chats")
      .aggregate([
        {
          $lookup: {
            from: "users",
            localField: "sender_id",
            foreignField: "user_id",
            as: "sender",
          },
        },
        {
          $match: {
            $or: [
              { sender_id: sender_id, receiver_id: receiver_id },
              { sender_id: receiver_id, receiver_id: sender_id },
            ],
          },
        },
        {
          $sort: { chat_id: 1 }, // Optional: Sort by chat_id if needed
        },
      ])
      .toArray();

    const decryptedChats = result.map((chat) => {
      // Decrypt the message with the shared secretKey
      const decryptedMsg = CryptoJS.AES.decrypt(chat.msg, secretKey).toString(
        CryptoJS.enc.Utf8
      );
      // console.log(decryptedMsg.msg);
      return {
        ...chat,
        msg: decryptedMsg,
      };
    });
    // console.log(decryptedChats);

    return res.status(200).json({ Status: "success", list: decryptedChats });
  } catch (error) {
    console.log(error);
    res.status(500).json({ Status: "error", message: "Failed to fetch chats" });
  }
});
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
app.post("/createGroup", async (req, res) => {
  try {
    const user_id = req.body.user_id;
    const g_name = req.body.group_name;
    const selectedUserIds = req.body.selectedUserIds; // Array of selected user IDs

    // Insert the group into the database
    const groupResult = await pool.query(
      "INSERT INTO groups ( g_name, admin_id) VALUES ($1, $2) returning *",
      [g_name, user_id]
    );
    const group_id = groupResult.rows[0].group_id;

    // Loop through the selectedUserIds and insert them as group members
    for (const memberId of selectedUserIds) {
      await pool.query("INSERT INTO members (user_id, g_id) VALUES ($1, $2)", [
        memberId,
        group_id,
      ]);
    }

    return res
      .status(200)
      .json({ Status: "success", group: groupResult.rows[0] });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      Status: "error",
      message: "An error occurred while creating the group.",
    });
  }
});
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
app.post("/fetchgroupmembers", async (req, res) => {
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
app.listen(5000, () => {
  console.log("server started at 5000");
});
