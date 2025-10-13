import express from "express";

//----------Firebase-------------//

import sendChat from "./firestore/chat.js";
import getChat from "./firestore/get.js";

import cancelledBooking from "./bookedServiceCancel.js";
import completedBookedService from "./bookedServiceCompleted.js";
import sendNotification from "./firestore/sendNotification.js";
import updateFcmToken from "./firestore/updateFcmToken.js";
import tokenVerification from "../../../middleware/token-verification/index.js";

const router = express.Router();

//update FCM token
router.put("/:id/:fcmToken", tokenVerification, updateFcmToken);

// get pro chat
router.get(
  "/conversation/:receiverId/:senderId/:proBooking",
  
  getChat
);

///--------On going cancelbooking Remove get (created,requested,accepted services)------///
router.put("/:id", tokenVerification, cancelledBooking);

///--------On going cancelbooking Remove get (created,requested,accepted services)------///
router.put("/completed/:id", tokenVerification, completedBookedService);

//---------pro chat to user----------//
router.post("/chat", tokenVerification, sendChat);

// sendNotification
router.post("/sendNotification", tokenVerification, sendNotification);

export default router;
