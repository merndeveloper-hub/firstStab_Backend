// // const Message = require('../models/Message');
// // const Chat = require('../models/Chat');

// import {
//   insertNewDocument,
//   updateDocument,
// } from "../../../../helpers/index.js";

// const onlineUsers = new Map();
// console.log(onlineUsers, "online");

// const handleSocket = (io) => {
//   io.on("connection", (socket) => {
//     console.log("[Socket] New connection on /api/socket:", socket.id);

//     socket.on("join", (userId) => {
//       onlineUsers.set(userId, socket.id);
//       console.log(`User ${userId} joined socket`);
//     });

//     socket.on(
//       "send_message",
//       async ({
//         chatId,
//         senderId,
//         receiverId,
//         message,
//         role,
//         userBooking,
//         proBooking,
//         isBooking,
//       }) => {
//       //   try{
//       //   if (isBooking) {
//       //     const findUserChat = await find("chatMessage", {
//       //       role: "user",
//       //       chatId,
//       //       userBooking,
//       //       proBooking,
//       //     });
//       //     if (findUserChat.length <= 7) {
//       //       socket.emit("chat_error", {
//       //   status: "error",
//       //   message: "User chat limit exceeded",
//       // });
//       // return;
//       //     }
//       //     const findProChat = await find("chatMessage", {
//       //       role: "pro",
//       //       chatId,
//       //       userBooking,
//       //       proBooking,
//       //     });
//       //     if (findProChat.length <= 7) {
//       //       socket.emit("chat_error", {
//       //   status: "error",
//       //   message: "Pro chat limit exceeded",
//       // });
//       // return;
    
//       //     }
        
//       //   }
      
//         //       const findChatRoom = await findOne("proBookingService",{chatChannelName:chatId})
//         //      let startTime = findChatRoom.orderStartTime

//         // console.log(chatId, senderId, receiverId, message,"chatId, senderId, receiverId, message");

//         const newMessage = await insertNewDocument("chatMessage", {
//           chatId,
//           senderId,
//           receiverId,
//           message,
//           role,
//           userBooking,
//           proBooking,
//           isBooking,
//         });
//         console.log(newMessage, "messagenew");

//         socket.to(senderId).emit("message_sent", newMessage);
//          socket.to(receiverId).emit("receive_message", newMessage);
//       //}
//   //     catch (err) {
//   // socket.emit("chat_error", {
//   //   status: "error",
//   //   message: "An unexpected error occurred",
//   //   error: err.message,
//   // });
// }
//    // }
//     );
//     console.log("final");

//     socket.on('disconnect', () => {
//       for (let [userId, socketId] of onlineUsers.entries()) {
//         if (socketId === socket.id) {
//           onlineUsers.delete(userId);
//           break;
//         }
//       }
//       console.log('[Socket] Disconnected:', socket.id);
//     });
//   });
// };

// export default handleSocket;


// import { find, findOne } from "../../../../helpers/index.js"; // Uncomment if needed
import {
  insertNewDocument,
  updateDocument,
} from "../../../../helpers/index.js";

const onlineUsers = new Map();

const handleSocket = (io) => {
  io.on("connection", (socket) => {
    console.log("[Socket] New connection:", socket.id);

    socket.on("join", (userId) => {
      onlineUsers.set(userId, socket.id);
      socket.join(userId); // Join room by userId
     // console.log(✅ User ${userId} joined socket room));
    });

    socket.on(
      "send_message",
      async ({
      c
      }) => {
        try {
          // Create and store the message
          const newMessage = await insertNewDocument("chatMessage", {
            chatId,
            senderId,
            receiverId,
            message,
            role,
            userBooking,
            proBooking,
            isBooking,
          });

          console.log("💾 New message:", newMessage);

          const senderSocketId = onlineUsers.get(senderId);
          const receiverSocketId = onlineUsers.get(receiverId);

          if (senderSocketId) {
            io.to(senderSocketId).emit("message_sent", newMessage);
          }

          if (receiverSocketId) {
            io.to(receiverSocketId).emit("receive_message", newMessage);
          }
        } catch (err) {
          console.error("❌ Error sending message:", err.message);
          socket.emit("chat_error", {
            status: "error",
            message: "An unexpected error occurred",
            error: err.message,
          });
        }
      }
    );

    socket.on("disconnect", () => {
      for (let [userId, socketId] of onlineUsers.entries()) {
        if (socketId === socket.id) {
          onlineUsers.delete(userId);
          break;
        }
      }
      console.log("[Socket] Disconnected:", socket.id);
    });
  });
};

export default handleSocket;