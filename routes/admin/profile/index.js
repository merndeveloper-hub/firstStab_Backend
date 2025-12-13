const express = require("express");
const updateAdminProfile = require("./update");
const multipart = require("connect-multiparty");
const multipartMiddleware = multipart();

const router = express.Router();

router.put(
  "/update",
  multipartMiddleware,
  updateAdminProfile
);

module.exports = router;
