import express from "express";

import getPayments from "./get.js";







const router = express.Router();


router.get("/:id", getPayments);
 //router.post("/",reviewService);


export default router;
