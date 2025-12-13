import express from "express";

import getFaqQuestion from "./get.js";
import tokenVerification from "../../../middleware/token-verification/index.js";


const router = express.Router();

//--get admin faq question
router.get("/get",tokenVerification, getFaqQuestion);


export default router;
