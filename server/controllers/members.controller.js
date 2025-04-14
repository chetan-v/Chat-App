const User = require("../models/users.model");

const list = async (req, res) => {
  try {
    const users = await User.find({});
    // console.log(users);
    return res.status(200).json({ Status: "success", list: users });
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  list,
};
