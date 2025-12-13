import express from "express";

import newRequestBooking from "./newRequestBooking.js";
import updateNewRequestBooking from "./updateNewRequestBooking.js";


// import getOnGoingBooking from "./onGoingBooking.js";
import cancelledBooking from "./cancelBooking.js";
import getOnGoingBooking from "./onGoingBooking.js";
import twilioToken from "./twilioVideoToken.js";
import twilioChatToken from "./twilioChatToken.js";
import deliveredBooking from "./deliveredService.js";
// import historyBooking from "./historyBooking.js";
import multipart from "connect-multiparty";
import userResheduleRequest from "./reshedule.js";
import resheduleAcceptBooking from "./resheduleAccept.js";
import cancelledRescheduleBooking from "./resheduleReject.js";
import resheduleDeliveredBooking from "./resheduleDeliveredService.js";
import priceQuoteBooking from "./priceQuoteBooking.js";
import tokenVerification from "../../../middleware/token-verification/index.js";
import rejectBooking from "./rejectBooking.js";

const multipartMiddleware = multipart();


const router = express.Router();

//router.get("/", newRequestBooking);
//router.post("/add",multipartMiddleware, addCategory);

//-----pro accept user request booking----//
 router.put("/newrequest/:id",tokenVerification,updateNewRequestBooking);
 
 //pro quote the user booking before booking accept
 router.put("/quote/:id",tokenVerification,priceQuoteBooking)

 //----- Pro delivered service--------//
 router.put("/delivered/:id",tokenVerification, multipartMiddleware, deliveredBooking);


 //-----Pro cancelled pro request booking----//
 router.put("/cancelled/:id",tokenVerification, cancelledBooking);


 //-----Pro cancelled pro request booking----//
 router.put("/reject/:id",tokenVerification, rejectBooking);

//-----Get User pending,Accepted and OnGoing request related to categorie,subCategory with serviceType----//
router.get("/newrequest/:id",tokenVerification, newRequestBooking);

//-----Get User pending,Accepted and OnGoing request related to categorie,subCategory with serviceType----//
router.get("/bookservices/:id",tokenVerification, getOnGoingBooking);


//create twilio video token
router.post("/twilio/token", twilioToken);


//create twilio chat token
router.post("/twilio/chattoken", twilioChatToken);

//-----Reshedule Request -----//
router.put("/reshedule",tokenVerification, userResheduleRequest);

//-----Reshedule Request accept -----//
router.put("/resheduleaccept",tokenVerification, resheduleAcceptBooking);


//-----Reshedule Request cancel -----//
router.put("/reshedulecancel/:id",tokenVerification, cancelledRescheduleBooking);


 //----- Pro delivered reshedule service--------//
 router.put("/deliveredreshedule/:id",tokenVerification, multipartMiddleware, resheduleDeliveredBooking);

export default router;
