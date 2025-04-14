const Groups = require("../models/groups.model");

const Members = require("../models/members.model");

const createGroup = async (req, res) => {
  try {
    const adminId = req.user.user_id;
    const groupName = req.body.groupName;
    const selectedUserIds = req.body.selectedUserIds; // Array of selected user IDs
    selectedUserIds.push(adminId);

    // Insert the group into the database

    // Create the group
    const newGroup = new Groups({
      groupName: groupName,
      adminId: adminId,
    });
    const groupResult = await newGroup.save();

    // Loop through the selectedUserIds and insert them as group members
    const group_id = groupResult._id;
    const memberPromises = selectedUserIds.map(async (memberId) => {
      const newMember = new Members({
        userId: memberId,
        groupId: group_id,
      });
      await newMember.save();
    });
    await Promise.all(memberPromises);
    return res.status(200).json({ Status: "success", group: groupResult });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      Status: "error",
      message: "An error occurred while creating the group.",
    });
  }
};
const groupList = async (req, res) => {
  try {
    const userId = req.user.user_id; // Assuming the user ID is available in req.user.id
    console.log(userId);
    // Find the groupIds where the user is a member
    const memberRecords = await Members.find({ userId: userId }).select(
      "groupId"
    );
    const groupIds = memberRecords.map((record) => record.groupId);

    // Find the groups that match the groupIds
    const groups = await Groups.find({ _id: { $in: groupIds } });

    return res.status(200).json({ Status: "success", list: groups });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ Status: "error", message: "Server error" });
  }
};
module.exports = {
  createGroup,
  groupList,
};
