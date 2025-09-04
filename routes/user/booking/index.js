import express from "express";

import booking from "./getBooking.js";
import cancelledBooking from "./cancleBooking.js";
import proServiceRequest from "./getProServiceReq.js";
import userAcceptProServiceRequest from "./userAcceptProServiceRequest.js";
import twilioToken from "./twilioVideoToken.js";
import twilioChatToken from "./twilioChatToken.js";
import completedBooking from "./completedBooking.js";
import userResheduleRequest from "./reshedule.js";
import resheduleAcceptBooking from "./resheduleAccept.js";
import cancelledRescheduleBooking from "./resheduleReject.js";
import timerCancelBooking from "./timerCancelBooking.js";
import tokenVerification from "../../../middleware/token-verification/index.js";

const router = express.Router();

///--------User get all created,requested,accepted services------///
router.get("/:id", tokenVerification, booking);

//router.post("/add",multipartMiddleware, addCategory);

//user accept pro request
//router.put("/holdamount/:id", userAcceptProServiceRequest);

//create twilio chat token
router.post("/twilio/chattoken", tokenVerification, twilioChatToken);

//create twilio video token
router.post("/twilio/token", tokenVerification, twilioToken);

///--------Remove get (created,requested,accepted services)------///
router.put("/cancelled/:id", tokenVerification, cancelledBooking);

///-----------Request timer cancel-----////
router.put("/timercancel/:id", tokenVerification, timerCancelBooking);

//----User accepted Pro Accepted services----//
router.put("/useraccept/:id", tokenVerification, userAcceptProServiceRequest);

//----Get Pro Accepted services----//
router.get("/proaccept/:id", tokenVerification, proServiceRequest);

//----- User completed service--------//
router.put("/completed/:id", tokenVerification, completedBooking);

//-----Reshedule Request -----//
router.put("/reshedule", tokenVerification, userResheduleRequest);

//-----Reshedule Request accept -----//
router.put("/resheduleaccept", tokenVerification, resheduleAcceptBooking);

//-----Reshedule Request cancel -----//
router.put(
  "/reshedulecancel/:id",
  tokenVerification,
  cancelledRescheduleBooking
);

export default router;
