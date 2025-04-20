const express = require("express");
const getdata = require('./getdata');
const senddata = require('./senddata');
const sendpandoradata = require('./sendpandoradata');
const getpandoradata = require('./getpandoradata');
const router = express.Router();


router.post("/send-data", senddata);
router.get("/get-data", getdata);
router.post("/send-pandoradata", sendpandoradata);
router.get("/get-pandoradata", getpandoradata);

module.exports = router