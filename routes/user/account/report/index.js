import express from "express";
//import addCategory from "./add-category.js";


import postQuery from "./postQuery.js";
import getBooking from "./getBooking.js";





const router = express.Router();


 router.post("/query",postQuery);
 

router.get("/:id" ,getBooking);

export default router;
