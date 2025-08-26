import express from "express";

import getPayments from "./get.js";







const router = express.Router();


router.get("/:id/:month/:year", getPayments);
 //router.post("/",reviewService);


export default router;
