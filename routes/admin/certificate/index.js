import express from "express";

import getSingleProCertificate from "./get.js";

const router = express.Router();

// //-------------Get Pro Service Certificate--------------//
router.get("/:id", getSingleProCertificate);

export default router;
