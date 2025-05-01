// const Message = require('../models/Message');
// const Chat = require('../models/Chat');

import { insertNewDocument, updateDocument } from "../../../../helpers/index.js";

const onlineUsers = new Map();
console.log(onlineUsers,"online");

const handleSocket = (io) => {
  io.on('connection', (socket) => {
    console.log('[Socket] New connection on /api/socket:', socket.id);

    socket.on('join', (userId) => {
      onlineUsers.set(userId, socket.id);
      console.log(`User ${userId} joined socket`);
    });

    socket.on('send_message', async ({ chatId, senderId, receiverId, message,role }) => {
      
      const findChatRoom = await findOne("proBookingService",{chatChannelName:chatId})
     let startTime = findChatRoom.orderStartTime

console.log(chatId, senderId, receiverId, message,"chatId, senderId, receiverId, message");

      const newMessage = await insertNewDocument("chatMessage",{chatId, senderId, receiverId, message,role})
      console.log(newMessage,"messagenew");
    
   

      socket.emit('message_sent', newMessage);
    });
console.log("final");

    socket.on('disconnect', () => {
      for (let [userId, socketId] of onlineUsers.entries()) {
        if (socketId === socket.id) {
          onlineUsers.delete(userId);
          break;
        }
      }
      console.log('[Socket] Disconnected:', socket.id);
    });
  });
};

export default handleSocket;



// socket.on('send_message', async ({ chatId, senderId, receiverId, message, role }) => {
//   const findChatRoom = await findOne("proBookingService", { chatChannelName: chatId });

//   if (!findChatRoom) {
//     return socket.emit('error', { message: "Chat not found." });
//   }

//   const startTime = findChatRoom.orderStartTime; // "20:40:25" format
//   const startDateTime = new Date();
//   const [hours, minutes, seconds] = startTime.split(':');
//   startDateTime.setHours(+hours, +minutes, +seconds, 0);

//   const now = new Date();
//   const elapsedMs = now - startDateTime;
//   const elapsedMinutes = elapsedMs / (1000 * 60);

//   // Get previous messages count for this chat
//   const allMessages = await findMany("chatMessage", { chatId });
//   const totalMessages = allMessages.length;

//   // 14 message limit logic
//   if (totalMessages >= 14) {
//     return socket.emit('message_limit_reached', {
//       message: "Message limit reached. Please extend the chat to continue.",
//       paymentRequired: true
//     });
//   }

//   // (Optional) Check time limit (30 min)
//   if (elapsedMinutes > 30) {
//     return socket.emit('session_expired', {
//       message: "Chat session expired. Please pay to reopen the chat.",
//       paymentRequired: true
//     });
//   }

//   // Send and save new message
//   const newMessage = await insertNewDocument("chatMessage", {
//     chatId,
//     senderId,
//     receiverId,
//     message,
//     role
//   });

//   socket.emit('message_sent', newMessage);
// });
