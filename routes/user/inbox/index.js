import express from "express";


import getBookingChats from "./get.js";


const router = express.Router();

router.get("/:id", getBookingChats);
//router.post("/add",multipartMiddleware, addCategory);
 //router.put("/:id",multipartMiddleware, updateCategory);
 //router.delete("/:id", deleteCategory);
// Get Single Blog
//router.get("/single/:id", getSingleCategory);

export default router;
