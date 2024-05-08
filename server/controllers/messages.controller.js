const CryptoJS = require("crypto-js");
const Chats = require("../models/chats.model");

const createChat = async (req, res) => {
  try {
    const sender_id = req.user.user_id;
    const receiver_id = req.body.receiver_id;
    const originalMsg = req.body.msg;
    // console.log(sender_id, receiver_id, originalMsg);

    // Encrypt the message with the shared secretKey
    const encryptedMsg = CryptoJS.AES.encrypt(
      originalMsg,
      process.env.SECRET_CHAT_KEY
    ).toString();
    // console.log(encryptedMsg);
    const newMessage = new Chats({
      senderId: sender_id,
      receiverId: receiver_id,
      msg: encryptedMsg,
    });
    await newMessage.save();

    return res.status(200).json({ Status: "success", newMessage });
  } catch (error) {
    console.log(error);
    res.status(500).json({ Status: "error", message: "Failed to create chat" });
  }
};

const fetchchats = async (req, res) => {
  try {
    const senderId = req.user.user_id;
    const receiverId = req.body.receiver_id;
    // console.log(senderId);
    // console.log(receiverId);
    const chats = await Chats.find({
      $or: [
        { senderId, receiverId },
        { senderId: receiverId, receiverId: senderId },
      ],
    }).sort({ timestamp: 1 });

    // console.log(chats);

    const decryptedChats = chats.map((chat) => {
      const decryptedMsg = CryptoJS.AES.decrypt(
        chat.msg,
        process.env.SECRET_CHAT_KEY
      ).toString(CryptoJS.enc.Utf8);
      return {
        ...chat.toObject(),
        msg: decryptedMsg,
      };
    });

    return res.status(200).json({ Status: "success", list: decryptedChats });
  } catch (error) {
    console.log(error);
    res.status(500).json({ Status: "error", message: "Failed to fetch chats" });
  }
};

module.exports = {
  createChat,
  fetchchats,
};
