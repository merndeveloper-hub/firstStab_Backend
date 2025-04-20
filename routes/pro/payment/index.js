import express from "express";


import stripePayment from "./stripe.js";


const router = express.Router();

router.post(
  "/checkout",
  stripePayment
);
//router.get("/:id", getMetaData);

export default router;
