const express = require("express");
const pool = require("./db");
const cors = require("cors");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const CryptoJS = require("crypto-js");
const io = require("socket.io")(5001, {
  cors: {
    origin: "http://localhost:3000",
  },
});

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
  const ifExist = users.find((user) => user.user_id === user_id);
  if(!ifExist){
    const user = {user_id, socket_id: socket.id };
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
    if(receiver){
      io.to(receiver.socket_id).to(sender.socket_id).emit("getMessage", {
        receiver:receiver.user_id,
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


//routes


app.post("/signup", async (req, res) => {
  try {
    const name = req.body.name;
    const password = req.body.password;
    const email = req.body.email;
    const dob = req.body.dob;
    const gender = req.body.gender;
    const existingUser = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );
    if (existingUser.rows.length > 0) {
      return res.status(409).json({ message: "Email.already exist" });
    }
    bcrypt.hash(password, saltRounds, (err, hash) => {
      try {
        pool.query(
          "INSERT INTO users (name,password,email,dob,gender) VALUES($1,$2,$3,$4,$5) returning *",
          [name, hash, email, dob, gender]
        );
        console.log("user added");
        return res.sendStatus(200);
      } catch (error) {
        console.log(error);
      }
    });
  } catch (err) {
    console.log(err.message);
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
    
        req.user= {
            name:decoded.name,
            email:decoded.email,
            user_id:decoded.user_id
        }
        next();
      }
    });
  }
};
app.get("/", verifyUser, (req, res) => {
    res.json({ Status: "success" ,name:req.user.name,email:req.user.email,user_id:req.user.user_id});
    })
// login
app.post("/login", async (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  pool.query(
    "SELECT * FROM users WHERE email = $1;",
    [email],
    (err, result) => {
      if (err) {
        return res.status(400).json({ message: "bad request" });
      }
      if (result.rows.length > 0) {
        bcrypt.compare(
          password,
          result.rows[0].password,
          (bcryptErr, bcryptRes) => {
            if (bcryptRes) {
              const name = result.rows[0].name;
              const email = result.rows[0].email;
              const user_id = result.rows[0].user_id;
              const token = jwt.sign({ name ,email,user_id}, "our-secret-key", {
                expiresIn: "1h",
              });
              res.cookie("token", token);

              return res.status(200).json({ status: "success" });
            } else {
              return res.status(401).json({ message: "wrong password" });
            }
          }
        );
      } else {
        return res.status(401).json({ message: "wrong email" });
      }
    }
  );
});
// logout
app.get("/logout", (req, res) => {
  res.clearCookie("token");
  return res.status(200).json({ status: "success" });
});

// get list
app.get("/list", verifyUser, async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM users");
    return res.status(200).json({ Status: "success", list: result.rows });
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
} );

// create oneoneone chat
const secretKey="kutta";
app.post("/createchat", verifyUser, async (req, res) => {
  try {
    const sender_id = req.user.user_id;
    const receiver_id = req.body.receiver_id;
    const originalMsg = req.body.msg;

    // Encrypt the message with the shared secretKey
    const encryptedMsg = CryptoJS.AES.encrypt(originalMsg, secretKey).toString();
console.log(encryptedMsg);
    const result = await pool.query(
      "INSERT INTO chats (sender_id, receiver_id, msg) VALUES ($1, $2, $3) returning *",
      [sender_id, receiver_id, encryptedMsg]
    );

    return res.status(200).json({ Status: "success", list: result.rows });
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

    const result = await pool.query(
      "SELECT * FROM chats LEFT JOIN users ON users.user_id=chats.sender_id WHERE (sender_id = $1 AND receiver_id = $2) OR (sender_id = $2 AND receiver_id = $1) ORDER BY chat_id",
      [sender_id, receiver_id]
    );
    console.log(result.rows);

    const decryptedChats = result.rows.map((chat) => {
      // Decrypt the message with the shared secretKey
      const decryptedMsg = CryptoJS.AES.decrypt(chat.msg, secretKey).toString(CryptoJS.enc.Utf8);
      // console.log(decryptedMsg.msg);
      return {
        ...chat,
        msg: decryptedMsg,
      };
    });
    console.log(decryptedChats);

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
} );
// create group
app.post("/createGroup",verifyUser, async (req, res) => {
  try {
    
    const user_id = req.user.user_id;
    const g_name = req.body.group_name;
    const selectedUserIds = req.body.selectedUserIds; // Array of selected user IDs

    // Insert the group into the database
    const groupResult = await pool.query(
      "INSERT INTO groups ( g_name, admin_id) VALUES ($1, $2) returning *",
      [ g_name, user_id]
    );
    const group_id = groupResult.rows[0].group_id;

   // Loop through the selectedUserIds and insert them as group members
    for (const memberId of selectedUserIds) {
      await pool.query(
        "INSERT INTO members (user_id, g_id) VALUES ($1, $2)",
        [memberId, group_id]
      );
    }

    return res.status(200).json({ Status: "success", group: groupResult.rows[0] });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ Status: "error", message: "An error occurred while creating the group." });
  }
});
//fetch groups
app.get("/grouplist", verifyUser, async (req, res) => {
  try {
    const user_id = req.user.user_id;
    const result = await pool.query(
      "SELECT * FROM groups WHERE group_id IN (SELECT g_id FROM members WHERE user_id = $1)",
      [user_id]
    );
    return res.status(200).json({ Status: "success", list: result.rows });
  } catch (error) {
    console.log(error);
  }
} );
app.delete("/deleteGroup/:groupId", async (req, res) => {
  try {
    const groupId = req.params.groupId;

    // First, delete the group
    const groupDeleteResult = await pool.query("DELETE FROM groups WHERE group_id = $1", [groupId]);

    if (groupDeleteResult.rowCount === 0) {
      // Check if the group was not found
      return res.status(404).json({ Status: "error", message: "Group not found." });
    }

    // Second, delete associated members
    const membersDeleteResult = await pool.query("DELETE FROM members WHERE g_id = $1", [groupId]);

    return res.status(200).json({ Status: "success", message: "Group and associated members deleted." });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ Status: "error", message: "An error occurred while deleting the group." });
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
      [newMember_id,group_id]
    );
    return res.status(200).json({ Status: "success", list: result.rows });
  } catch (error) {
    console.log(error);
  }
} );

//fetch groups members
app.get("/fetchgroupmembers",verifyUser, async (req, res) => {
  try {
    const user_id = req.body.user_id;
    const result = await pool.query(
      "SELECT u.name FROM users u JOIN members m ON u.user_id = m.user_id JOIN groups g ON m.g_id = g.group_id WHERE g.group_id = (SELECT g_id FROM members WHERE user_id = $1);",
      [user_id]
    );
    return res.status(200).json({ Status: "success", list: result.rows });
  } catch (error) {
    console.log(error);
  }
} );

//create group chat






// listen at 5000
app.listen(5000, () => {
  console.log("server started at 5000");
});


