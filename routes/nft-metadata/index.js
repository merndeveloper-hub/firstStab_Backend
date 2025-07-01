const express = require("express");
// const { upload } = require("../../lib/multer");
const createMetaData = require("./create");
const getMetaData = require("./get");
const multipart = require("connect-multiparty");
const multipartMiddleware = multipart();

const router = express.Router();

router.post(
  "/",
  //   upload.single("nft_image"),
  multipartMiddleware,
  createMetaData
);
router.get("/:id", getMetaData);

module.exports = router;
