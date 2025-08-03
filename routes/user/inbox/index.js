import express from "express";


import getBookingChats from "./get.js";
import getBookingChat from "./get-single-blog.js";


const router = express.Router();

router.get("/single", getBookingChat);
router.get("/:id", getBookingChats);


export default router;
