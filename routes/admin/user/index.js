import express from "express";




import getUser from "./get.js";
import getSingleUser from "./getSingle.js";
import hideUser from "./hide.js";
import findUser from "./totalUser.js";


const router = express.Router();





//-------------Total User--------------//
router.get("/alluser", findUser);

//-------------Get All User Category--------------//
router.get("/", getUser);


//-------------Get Single User--------------//
router.get("/:id", getSingleUser);

//-------------Hide Single User--------------//
router.put("/hide/:id", hideUser);


export default router;
