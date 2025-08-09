import express from "express";
//import newRequestBooking from "./newRequestBooking.js";
//import addCategory from "./add-category.js";
//import getAllCategories from "./get-AllCategories.js";
//import getSingleCategory from "./get-single-blog.js";
//import deleteCategory from "./delete-blog.js";
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

const multipartMiddleware = multipart();


const router = express.Router();

//router.get("/", newRequestBooking);
//router.post("/add",multipartMiddleware, addCategory);

//-----pro accept user request booking----//
 router.put("/newrequest/:id",updateNewRequestBooking);
 
 //pro quote the user booking before booking accept
 router.put("/quote/:id",priceQuoteBooking)

 //----- Pro delivered service--------//
 router.put("/delivered/:id", multipartMiddleware, deliveredBooking);


 //-----Pro cancelled pro request booking----//
 router.put("/cancelled/:id", cancelledBooking);


//-----Get User pending,Accepted and OnGoing request related to categorie,subCategory with serviceType----//
router.get("/newrequest/:id", newRequestBooking);

//-----Get User pending,Accepted and OnGoing request related to categorie,subCategory with serviceType----//
router.get("/bookservices/:id", getOnGoingBooking);


//create twilio video token
router.post("/twilio/token", twilioToken);


//create twilio chat token
router.post("/twilio/chattoken", twilioChatToken);

//-----Reshedule Request -----//
router.put("/reshedule", userResheduleRequest);

//-----Reshedule Request accept -----//
router.put("/resheduleaccept", resheduleAcceptBooking);


//-----Reshedule Request cancel -----//
router.put("/reshedulecancel/:id", cancelledRescheduleBooking);


 //----- Pro delivered reshedule service--------//
 router.put("/deliveredreshedule/:id", multipartMiddleware, resheduleDeliveredBooking);

export default router;
