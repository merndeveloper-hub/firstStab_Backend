const express = require("express");
// const { upload } = require("../../../lib/multer");
const updateAdminProfile = require("./update");
const multipart = require("connect-multiparty");
const multipartMiddleware = multipart();

const router = express.Router();

router.put(
  "/update",
  //  upload.single("profile_img"),
  multipartMiddleware,
  updateAdminProfile
);

module.exports = router;
