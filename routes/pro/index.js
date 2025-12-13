import express from "express";

import booking from "./booking/index.js";
import serviceDetail from "./serviceDetail/index.js";

import faqQuestion from "./faqQuestion/index.js";

import contentPages from "./contentPages/index.js";
import business from "./business/index.js";
import updateProfile from "./profile/index.js";
import stripePayment from "./payment/index.js";
import home from "./home/index.js";
import certificate from "./certificate/index.js";
import paymentMethod from "./paymentMethod/index.js";
const router = express.Router();


router.use("/servicedetail", serviceDetail);
router.use("/booking", booking);
router.use("/profile", updateProfile); // after login check the token
router.use("/business", business);
router.use("/home", home);
router.use("/paymentMethod", paymentMethod);
router.use("/contentPage", contentPages);
router.use("/faqQuestion", faqQuestion);
router.use("/payment", stripePayment);
router.use("/certificate", certificate);


export default router;
