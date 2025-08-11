import express from "express";


import getBookingChats from "./get.js";
import getBookingChat from "./get-single-blog.js";


const router = express.Router();

router.post("/single", getBookingChat);
router.get("/:id/:user", getBookingChats);


export default router;
