import express from "express";

import getContentPage from "./get.js";
import singleContentPage from "./getSingle.js";
import contactUs from "./contactUs.js";
import getInfo from "./getinfo.js";
import getFaqQuestion from "./getFAQ.js";
import tokenVerification from "../../../middleware/token-verification/index.js";

const router = express.Router();
router.get("/getques", tokenVerification, getFaqQuestion);

router.get("/", tokenVerification, getContentPage);

router.get("/:id", tokenVerification, singleContentPage);

// Contact Us
router.get("/contact/:id", tokenVerification, getInfo);
router.post("/:id", tokenVerification, contactUs);

// FAQ Questions

export default router;
