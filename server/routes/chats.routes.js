const {
  createChat,
  fetchchats,
  createGroupChat,
  fetchGroupChats,
} = require("../controllers/messages.controller.js");
const verifyUser = require("../middleware/securityRoute.js");
const express = require("express");
const router = express.Router();

// create oneoneone chat
router.post("/createchat", verifyUser, createChat);

//fetch chats
router.post("/fetchchats", verifyUser, fetchchats);

router.post("/createGroupChat", verifyUser, createGroupChat);

//fetch group chats
router.post("/fetchGroupChats", verifyUser, fetchGroupChats);

module.exports = router;
