import express from "express";

import getInvitationStatus from "./get.js";
//import activeProService from "./serviceActive.js";

const router = express.Router();

// //-------------Get checkr invitation status --------------//
router.get("/:id", getInvitationStatus);


//-----Active pro service-------/
//router.put("/activeservice/:id",activeProService)

export default router;
