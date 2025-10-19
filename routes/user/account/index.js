import express from "express";

import address from "./address/index.js";
import profile from "./profile/index.js";
import payment from "./paymentMethod/index.js";
import paymenthistory from "./paymentHistory/index.js";
import reviews from "./reviews/index.js";
import reportQuery from "./report/index.js";

const router = express.Router();

//router.get("/", getAllCategories);
router.use("/address",address);
router.use("/profile", profile);
router.use("/payment", payment);
router.use("/paymenthistory", paymenthistory);
router.use("/review", reviews);
router.use("/report", reportQuery);


export default router;
