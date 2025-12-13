import express from "express";




import getBooking from "./get.js";

import findBooking from "./total.js";


const router = express.Router();




//-------------Total User--------------//
router.get("/all", findBooking);

// //-------------Get All User Category--------------//
router.get("/", getBooking);




export default router;
