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
import tokenVerification from "../../../../middleware/token-verification/index.js";


const router = express.Router();


///---------------Auth token----------------//
router.get("/",tokenVerification, getAccessToken);

///---------------User Payment to Admin account ----------------//
router.post("/pay", createPaypalOrder);

router.post("/admintopro", sendPayout);

//router.post("/paypal", paypalPayment);

//------------user payment Successfully page-----//
router.get("/paypalsuccess", paypalSuccess);
//------------user payment cancel page-----//
router.get("/paypalcancel", paymentCancel);
//------------user  stripe payment Successfully page-----//
router.get("/stripesuccess", stripeSuccess);

//------------user stripe payment cancel page-----//
router.get("/stripecancel", stripeCancel);





export default router;
