

import { insertNewDocument } from "../../../../helpers/index.js";

const onlineUsers = new Map();


const handleSocket = (io) => {
  io.on('connection', (socket) => {
    console.log('[Socket] New connection on /api/socket:', socket.id);

    socket.on('join', (userId) => {
      onlineUsers.set(userId, socket.id);

    });

    socket.on('send_message', async ({ chatId, senderId, receiverId, message, role }) => {


      const newMessage = await insertNewDocument("chatMessage", { chatId, senderId, receiverId, message, role })




      socket.emit('message_sent', newMessage);
    });


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
