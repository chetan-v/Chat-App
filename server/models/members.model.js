const mongoose = require("mongoose");

const memberSchema = new mongoose.Schema({
  groupId: {
    type: mongoose.Schema.Types.ObjectId, // Assuming admin_id is ObjectId
    ref: "Group",
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
});
const Members = mongoose.model("members", memberSchema);

module.exports = Members;
