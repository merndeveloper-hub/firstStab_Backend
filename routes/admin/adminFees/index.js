import express from "express";


import adminCharges from "./add.js";
import getadminCharge from "./get.js";
import updateAdminCharge from "./update.js";
import hideadminFees from "./hide.js";


const router = express.Router();

//-------------Get App admin charges--------------//
router.get("/", getadminCharge);

//-------------Update App admin charges--------------//
router.put("/:id",updateAdminCharge)
//-------------Add App admin charges--------------//
router.post("/",adminCharges)

//----Hide Single FAQ Question--------//
router.put("/hide/:id", hideadminFees);


export default router;
