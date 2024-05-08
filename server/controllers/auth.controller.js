const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const User = require("../models/users.model");
const saltRounds = 10;
const signup = async (req, res) => {
  try {
    const name = req.body.name;
    const password = req.body.password;
    const email = req.body.email;
    const dob = req.body.dob;
    const gender = req.body.gender;
    console.log(name);

    const existingUser = await User.findOne({ email });
    console.log(existingUser);

    if (existingUser) {
      return res.status(409).json({ message: "Email already exists" });
    }

    const hash = bcrypt.hashSync(password, saltRounds);
    const newUser = new User({
      name: name,
      password: hash,
      email: email,
      dob: dob,
      gender: gender,
    });
    await newUser.save();

    console.log("Document inserted successfully:");

    return res.sendStatus(200);
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const login = async (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: "wrong email" });
    }

    bcrypt.compare(password, user.password, (bcryptErr, bcryptRes) => {
      if (bcryptRes) {
        const { name, email, _id } = user;
        const token = jwt.sign({ name, email, _id }, process.env.SECRET_KEY, {
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
};

const logout = (req, res) => {
  res.clearCookie("token");
  return res.status(200).json({ status: "success" });
};

module.exports = {
  login,
  signup,
  logout,
};
