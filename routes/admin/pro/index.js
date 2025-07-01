import express from "express";




import getUser from "./get.js";
import getSingleUser from "./getSingle.js";
import hideUser from "./hide.js";
import findUser from "./totalPro.js";
import hideService from "./hideService.js";

const router = express.Router();




//-------------Total User--------------//
router.get("/allpro", findUser);

//-------------Get All User Category--------------//
router.get("/", getUser);


//-------------Get Single User--------------//
router.get("/:id", getSingleUser);

//-------------Hide Single User--------------//
router.put("/hide/:id", hideUser);


//-------------Hide Single service--------------//
router.put("/hideservice/:id", hideService);



export default router;
