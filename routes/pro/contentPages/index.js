import express from "express";

import getContentPage from "./get.js";
import tokenVerification from "../../../middleware/token-verification/index.js";


const router = express.Router();


router.get("/",tokenVerification, getContentPage);


export default router;
