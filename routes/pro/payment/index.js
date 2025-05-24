import express from "express";


//import stripePayment from "./stripe.js";

import getAccessToken from "./accessToken.js";
import createPaypalOrder from "./paypal.js";
//import paypalPayment from "./capturePayment.js";
import paypalSuccess from "./paypalSuccess.js";
import paymentCancel from "./paypalCancel.js";
import stripeSuccess from "./stripeSuccess.js";
import stripeCancel from "./stripeCancel.js";
import getbgLink from "./bgLink.js";
//import sendPayout from "./adminToProAccount.js";
//import capturePayment from "./capturePayment.js";

const router = express.Router();

// router.post(
//   "/checkout",
//   stripePayment
// );


///---------------Auth token----------------//
router.get("/", getAccessToken);

///---------------User Payment to Admin account ----------------//
router.post("/checkout", createPaypalOrder);

// router.post("/admintopro", sendPayout);

//router.post("/paypal", paypalPayment);

//------------user payment Successfully page-----//
router.get("/paypalsuccess", paypalSuccess);

//------------user payment cancel page-----//
router.get("/paypalcancel", paymentCancel);


//------------user  stripe payment Successfully page-----//
router.get("/stripesuccess", stripeSuccess);

//------------user stripe payment cancel page-----//
router.get("/stripecancel", stripeCancel);


//------------bg link get from proCategories-----//
router.get("/bglink/:id", getbgLink);
export default router;






// const router = express.Router();


