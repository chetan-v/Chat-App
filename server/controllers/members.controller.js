const Groups = require("../models/groups.model");
const User = require("../models/users.model");
const Member = require("../models/members.model");
const list = async (req, res) => {
  try {
    const users = await User.find({});
    // console.log(users);
    return res.status(200).json({ Status: "success", list: users });
  } catch (error) {
    console.log(error);
  }
};
const groupList = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const Group = await Groups.find({});
    // Import your models

    // Mongoose query to retrieve user names from members
    Member.find({})
      .populate({
        path: "user_id",
        model: "User",
        select: "name", // Select only the 'name' field from the 'User' collection
      })
      .exec((err, members) => {
        if (err) {
          console.error("Error:", err);
          return;
        }
        // Extract group ids from members
        const groupIds = members.map((member) => member.g_id);

        // Mongoose query to retrieve group names based on group ids
        Group.find({ _id: { $in: groupIds } })
          .select("g_name") // Select only the 'g_name' field
          .exec((err, groups) => {
            if (err) {
              console.error("Error:", err);
              return;
            }
            // Create a map to quickly look up group names by group id
            const groupMap = new Map(
              groups.map((group) => [group._id.toString(), group.g_name])
            );

            // Extract user names and group names using the groupMap
            const results = members.map((member) => ({
              user_name: member.user_id.name,
              g_name: groupMap.get(member.g_id.toString()),
            }));

            console.log("Results:", results);
          });
      });

    return res.status(200).json({ Status: "success", list: Group });
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  list,
  groupList,
};
