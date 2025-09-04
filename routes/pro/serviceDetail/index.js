import express from "express";



import cancelledBooking from "./bookedServiceCancel.js";
import completedBookedService from "./bookedServiceCompleted.js";

//----------Firebase-------------//

import sendChat from "./firestore/chat.js";
import getChat from "./firestore/get.js";
import tokenVerification from "../../../middleware/token-verification/index.js";

const router = express.Router();





///--------On going cancelbooking Remove get (created,requested,accepted services)------///
router.put("/:id",tokenVerification, cancelledBooking);

///--------On going cancelbooking Remove get (created,requested,accepted services)------///
router.put("/completed/:id",tokenVerification, completedBookedService);





//---------pro chat to user----------//
router.post("/chat",tokenVerification, sendChat);

// get pro chat
router.get("/conversation/:chatId",tokenVerification, getChat);




export default router;
