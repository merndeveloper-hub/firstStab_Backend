import express from "express";




import refundBookingAmtDecide from "./refundCharges.js";
import getQuery from "./query.js";


const router = express.Router();

// admin decide krta hian jb dispute booking hoti hian kis pr kya charges lgani hain or kis ko return krni amount
router.post("/", refundBookingAmtDecide);
// jtni bhe query hoti hian woh get hoti hain
router.get("/:id", getQuery);

export default router;

