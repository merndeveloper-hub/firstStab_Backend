import express from "express";

import getSingleProCertificate from "./get.js";
import activeProService from "./serviceActive.js";
import getInvitationStatus from "./checkrStatus.js";

const router = express.Router();

// //-------------Get Pro Service Certificate--------------//
router.get("/:id", getSingleProCertificate);





// //-------------Get checkr invitation status --------------//
router.get("/checkrstatus/:id", getInvitationStatus);

//-----Active pro service-------/
router.put("/activeservice/:id",activeProService)

export default router;
