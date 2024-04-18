const mongoose = require("mongoose");
const messageSchema = new mongoose.Schema({
  sender_id: {
    type: mongoose.Schema.Types.ObjectId, // Assuming sender_id and receiver_id are ObjectIds
    required: true,
  },
  receiver_id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  msg: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});
const chats = mongoose.model("chats", messageSchema);

module.exports = chats;
