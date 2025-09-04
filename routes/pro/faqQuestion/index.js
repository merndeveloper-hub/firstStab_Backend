import express from "express";

import getFaqQuestion from "./get.js";
import tokenVerification from "../../../middleware/token-verification/index.js";


const router = express.Router();


router.get("/get",tokenVerification, getFaqQuestion);


export default router;
