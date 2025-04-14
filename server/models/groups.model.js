const mongoose = require("mongoose");

const groupSchema = new mongoose.Schema({
  adminId: {
    type: mongoose.Schema.Types.ObjectId, // Assuming admin_id is ObjectId
    ref: "User",
    required: true,
  },
  groupName: {
    type: String,
    required: true,
  },
});
const Groups = mongoose.model("groups", groupSchema);

module.exports = Groups;
