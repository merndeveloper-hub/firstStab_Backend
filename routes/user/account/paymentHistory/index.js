import express from "express";

import getPayments from "./get.js";








const router = express.Router();


router.get("/:id/:month/:year/:proPayment", getPayments);



export default router;
