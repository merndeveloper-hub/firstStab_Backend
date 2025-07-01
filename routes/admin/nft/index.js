const express = require("express");
const deleteNft = require("./delete");
const getNfts = require("./get");
const updateNfts = require("./update");

const router = express.Router();

router.get("/get", getNfts);
router.put("/update/:id", updateNfts);
router.delete("/delete/:id", deleteNft);

module.exports = router;
