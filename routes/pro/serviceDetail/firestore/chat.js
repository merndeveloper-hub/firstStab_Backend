

// import Joi from "joi";
// import firebaseConfig from "../../../../config/firebase/firebaseConfig.js"; // contains db, admin
// //import { Timestamp } from "firebase-admin/firestore";
// import { FieldValue } from "firebase-admin/firestore";

import { findOne, insertNewDocument } from "../../../../helpers/index.js";

// Optional: FCM Notification sender (add when ready)
// import { sendPushNotification } from "../../../../utils/fcm.js";

// const schemaBody = Joi.object().keys({
//   clientId: Joi.string().required(),
//   proId: Joi.string().required(),
//   text: Joi.string().allow("").optional(),
//   localTime: Joi.string().allow("").optional(),
//   mediaUrl: Joi.string().allow("").optional(),
//   mediaType: Joi.string().valid("image", "audio", "video", "file").optional(),
// });

const sendChat = async (req, res) => {
  
  try {
   // await schemaBody.validateAsync(req.body);
   // const { clientId, proId, text, localTime, mediaUrl, mediaType } = req.body;

// Create or get chat between two users
//router.post('/get-or-create', async (req, res) => {
  const { userId1, userId2 } = req.body;
console.log(req.body,"body");

  let chat = await findOne('chat',{participants: { $all: [userId1, userId2] }})
console.log(chat,"chat");

  // let chat = await Chat.findOne({
  //   participants: { $all: [userId1, userId2] }
  // });

  if (!chat) {
    chat = await insertNewDocument('chat',{participants: [userId1, userId2]})
    // chat = new Chat({ participants: [userId1, userId2] });
    // await chat.save();
  }
console.log(chat,"insertChat");

  res.json(chat);
//});

//     const senderId = clientId; // assuming client is the sender
//    // const receiverId = proId;
//    const chatId = `${proId}_${clientId}`;
// console.log(chatId,"chatId");

//     const message = {
//       senderId,
//       senderRole:"user",
//       text: text || "",
//       mediaUrl: mediaUrl || null,
//       mediaType: mediaType || null,
//       localTime: localTime || null,
//     createdAt:new Date(),
//       timestamp: FieldValue.serverTimestamp(),
//       readBy: [senderId], // sender has read their own message
//     };

//     const db = firebaseConfig.db;

//     // Add message to chat's messages subcollection
//     await db.collection("chats")
//       .doc(chatId)
//       .collection("messages")
//       .add(message);

//     // Update chat metadata
//     await db.collection("chats")
//       .doc(chatId)
//       .set({
//         participants: [clientId, proId],
//         lastMessage: text || mediaType || "media",
//       updatedAt: FieldValue.serverTimestamp()
//       }, { merge: true });

    // Optional: Push Notification Logic (Add if you need)
    // const receiver = await db.collection("users").doc(receiverId).get();
    // const fcmToken = receiver.data()?.fcmToken;
    // if (fcmToken) {
    //   await sendPushNotification(fcmToken, "New message", text || "📎 Media", {
    //     chatId,
    //     senderId
    //   });a
    // }

    return res.status(200).json({ success: true, message: "Message sent successfully!" });
  } catch (error) {
  
    console.error("Send Message Error:", error);
    return res.status(400).json({ error: error.message });
  }
  
};

export default sendChat;
