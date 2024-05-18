const express = require("express");

const router = express.Router();
const verifyUser = require("../middleware/securityRoute.js");
const { list } = require("../controllers/members.controller.js");

router.get("/list", verifyUser, list);

module.exports = router;
