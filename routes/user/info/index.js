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
//router.post("/add",multipartMiddleware, addCategory);
//router.put("/:id",multipartMiddleware, updateCategory);
//router.delete("/:id", deleteCategory);
// Get Single Blog
router.get("/:id", tokenVerification, singleContentPage);

// Contact Us
router.get("/contact/:id", tokenVerification, getInfo);
router.post("/:id", tokenVerification, contactUs);

// FAQ Questions

export default router;
