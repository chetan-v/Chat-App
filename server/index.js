const express = require("express");
const pool = require("./db");
const cors = require("cors");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
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
      return res.status(400).json({ message: "Email.already exist" });
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

// create chat
app.post("/createchat", verifyUser, async (req, res) => {
  try {
    const sender_id = req.user.user_id;
    const receiver_id = req.body.receiver_id;
    const msg = req.body.msg;
    console.log(sender_id, receiver_id, msg);
    const result = await pool.query(
      "INSERT INTO chats (sender_id,receiver_id,msg) VALUES($1,$2,$3) returning *",
      [sender_id, receiver_id, msg]
    );
    return res.status(200).json({ Status: "success", list: result.rows });
  } catch (error) {
    console.log(error);
  }
} );

//fetch chats
app.post("/fetchchats", verifyUser, async (req, res) => {
  try {
  const sender_id = req.user.user_id;
  const receiver_id = req.body.receiver_id;
    const result = await pool.query(
      "SELECT * FROM chats WHERE sender_id = $1 AND receiver_id = $2 OR sender_id = $2 AND receiver_id = $1",
      [sender_id, receiver_id]
    );
    return res.status(200).json({ Status: "success", list: result.rows });
  } catch (error) {
    console.log(error);
  }
} );





// listen at 5000
app.listen(5000, () => {
  console.log("server started at 5000");
});


