import express from "express";



import cancelledBooking from "./bookedServiceCancel.js";
import completedBookedService from "./bookedServiceCompleted.js";

//----------Firebase-------------//

import sendChat from "./firestore/chat.js";
import getChat from "./firestore/get.js";

const router = express.Router();





///--------On going cancelbooking Remove get (created,requested,accepted services)------///
router.put("/:id", cancelledBooking);

///--------On going cancelbooking Remove get (created,requested,accepted services)------///
router.put("/completed/:id", completedBookedService);





//---------pro chat to user----------//
router.post("/chat", sendChat);

// get pro chat
router.get("/conversation/:chatId", getChat);




export default router;
