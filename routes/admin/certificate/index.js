import express from "express";

import getSingleProCertificate from "./get.js";
import activeProService from "./serviceActive.js";

const router = express.Router();

// //-------------Get Pro Service Certificate--------------//
router.get("/:id", getSingleProCertificate);


//-----Active pro service-------/
router.put("/activeservice/:id",activeProService)

export default router;
