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
console.log(chatId, senderId, receiverId, message,"chatId, senderId, receiverId, message");

      const newMessage = await insertNewDocument("chatMessage",{chatId, senderId, receiverId, message,role})
      console.log(newMessage,"messagenew");
    
      // const newMessage = new Message({ chatId, senderId, receiverId, message });
      // await newMessage.save();
// await updateDocument('chat',{chatId},{
//   lastMessage: newMessage._id,
//   updatedAt: new Date()}
// )
      // await Chat.findByIdAndUpdate(chatId, {
      //   lastMessage: newMessage._id,
      //   updatedAt: new Date(),
      // });
// console.log(receiverId,"getttrev----------");
// onlineUsers.set(receiverId, socket.id);
//       const receiverSocket = onlineUsers.get(receiverId);
//       console.log(receiverSocket,"receiverSocket");
      
      // if (receiverSocket) {
      //   console.log("if");
        
      //   io.to(receiverSocket).emit('receive_message', newMessage);
      // }

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
