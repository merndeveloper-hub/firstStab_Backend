import express from "express";

import paypal from "./paypal/index.js";
import stripe from "./stripe/index.js";
const router = express.Router();

router.use("/paypal", paypal);
router.use("/stripe", stripe);

export default router;
