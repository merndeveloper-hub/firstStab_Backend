import express from "express";

import getSingleProCertificate from "./get.js";
import activeProService from "./serviceActive.js";
import getInvitationStatus from "./checkrStatus.js";
import rejectProService from "./rejectService.js";
import getCertnStatus from "./certnStatus.js";

const router = express.Router();

// //-------------Get Pro Service Certificate--------------//
router.get("/:id", getSingleProCertificate);



//--------------Get Certn report status ---//

router.get("/certnstatus/:id",getCertnStatus)

// //-------------Get checkr invitation status --------------//
router.get("/checkrstatus/:id", getInvitationStatus);

//-----Active pro service-------/
router.put("/activeservice/:id",activeProService)

// Admin reject pro service
router.put("/reject/:id",rejectProService)

export default router;
