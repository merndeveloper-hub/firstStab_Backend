import express from "express";




import getBooking from "./get.js";
//import getSingleUser from "./getSingle.js";
//import hideUser from "./hide.js";
import findBooking from "./total.js";
//import hideService from "./hideService.js";

const router = express.Router();




//-------------Total User--------------//
router.get("/all", findBooking);

// //-------------Get All User Category--------------//
 router.get("/", getBooking);


// //-------------Get Single User--------------//
// router.get("/:id", getSingleUser);

// //-------------Hide Single User--------------//
// router.put("/hide/:id", hideUser);


// //-------------Hide Single service--------------//
// router.put("/hideservice/:id", hideService);



export default router;
