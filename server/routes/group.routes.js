const {
  groupList,
  createGroup,
} = require("../controllers/createGroup.controller.js");
const verifyUser = require("../middleware/securityRoute.js");
const router = require("express").Router();

router.get("/groupList", verifyUser, groupList);
router.post("/creategroup", verifyUser, createGroup);
module.exports = router;
