import express from "express";




import refundBookingAmtDecide from "./refundCharges.js";
import getQuery from "./query.js";


const router = express.Router();


router.post("/", refundBookingAmtDecide);
router.get("/:id", getQuery);

export default router;

