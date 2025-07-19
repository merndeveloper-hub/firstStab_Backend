// const Message = require('../models/Message');
// const Chat = require('../models/Chat');

//import { insertNewDocument, updateDocument } from "../../../../helpers/index.js";

const onlineUsers = new Map();
console.log(onlineUsers,"online");

const userBookReqSocket = (io) => {
  io.on('connection', (socket) => {
    console.log('[Socket] New connection on /api/socket:', socket.id);

    // socket.on('join', (userId) => {
    //   onlineUsers.set(userId, socket.id);
    //   console.log(`User ${userId} joined socket`);
    // });

  //  socket.on('send_message', async ({ chatId, senderId, receiverId, message,role }) => {
      
//       const findChatRoom = await findOne("proBookingService",{chatChannelName:chatId})
//      let startTime = findChatRoom.orderStartTime

// console.log(chatId, senderId, receiverId, message,"chatId, senderId, receiverId, message");

    //  const newMessage = await insertNewDocument("chatMessage",{chatId, senderId, receiverId, message,role})
     // console.log(newMessage,"messagenew");
    
   

      socket.emit('userBooking', {
    message: 'User has been requested for service',
      });
    });
console.log("final");

    // socket.on('disconnect', () => {
    //   for (let [userId, socketId] of onlineUsers.entries()) {
    //     if (socketId === socket.id) {
    //       onlineUsers.delete(userId);
    //       break;
    //     }
    //   }
    //   console.log('[Socket] Disconnected:', socket.id);
    // });
  //});
};

export default userBookReqSocket;



