const express = require("express");
const { signup, login, logout } = require("../controllers/auth.controller.js");
const router = express.Router();

router.post("/signup", signup);

// login
router.post("/login", login);
// logout
router.get("/logout", logout);

module.exports = router;
