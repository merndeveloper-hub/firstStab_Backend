const express = require("express");
const deleteUser = require("./delete");
const getUsers = require("./get");
const updateUser = require("./update");
const activityUser = require("./activity");
// const tokenVerification = require("../../../middleware/token-verification/index")

const router = express.Router();

router.get("/get", getUsers);
router.put("/update/:id",updateUser);
router.get("/get/:id", activityUser);
router.delete("/delete/:id", deleteUser);

module.exports = router;
