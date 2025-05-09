import express from "express";



import getAccessToken from "./accessToken.js";
import createPaypalOrder from "./paypal.js";
//import paypalPayment from "./capturePayment.js";
import paypalSuccess from "./paypalSuccess.js";
import paymentCancel from "./paypalCancel.js";
import sendPayout from "./adminToProAccount.js";
//import capturePayment from "./capturePayment.js";
import stripeSuccess from "./stripeSuccess.js";
import stripeCancel from "./stripeCancel.js";


const router = express.Router();


///---------------Auth token----------------//
router.get("/", getAccessToken);

///---------------User Payment to Admin account ----------------//
router.post("/pay", createPaypalOrder);

router.post("/admintopro", sendPayout);

//router.post("/paypal", paypalPayment);

//------------user payment Successfully page-----//
router.get("/paypalsuccess", paypalSuccess);
//------------user payment cancel page-----//
router.get("/paypalcancel", paymentCancel);
//------------user  stripe payment Successfully page-----//
router.get("/stripe/paypalsuccess", stripeSuccess);

//------------user stripe payment cancel page-----//
router.get("/stripe/paypalcancel", stripeCancel);


export default router;
