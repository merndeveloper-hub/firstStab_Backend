import express from "express";


import getBookingChats from "./get.js";
import getBookingChat from "./get-single-blog.js";
import tokenVerification from "../../../middleware/token-verification/index.js";


const router = express.Router();

router.post("/single",tokenVerification, getBookingChat);
router.get("/:id/:user", getBookingChats);


export default router;
