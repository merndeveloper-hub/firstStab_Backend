import express from "express";

import getPayments from "./get.js";
import tokenVerification from "../../../../middleware/token-verification/index.js";







const router = express.Router();


router.get("/:id/:month/:year",tokenVerification, getPayments);
 //router.post("/",reviewService);


export default router;
