import {
  insertNewDocument,
  find,
} from "../../../../helpers/index.js";

// const onlineUsers = new Map();

const handleSocket = (io) => {
  io.on("connection", (socket) => {
    console.log("[Socket] New connection on /api/socket:", socket.id);

    socket.on("join", (userId) => {
      socket.join(userId);
      // onlineUsers.set(userId, socket.id);
    
    });

    socket.on(
      "send_message",
      async ({
        chatId,
        senderId,
        receiverId,
        message,
        role,
        userBooking,
        proBooking,
        isBooking,
      }) => {
        try {
          if (isBooking) {
            if (role === "user") {
              const findUserChat = await find("chatMessage", {
                role: "user",
                chatId,
                userBooking,
                proBooking,
              });

              if (findUserChat.length === 4) {
                socket.emit("chat_warning", {
                  status: "warning",
                  message:
                    "Reminder: You’ve used 4 messages out of your 7-message limit. Extend your chat now to continue beyond 7.",
                });
              }
              if (findUserChat.length >= 7) {
                socket.emit("chat_error", {
                  status: "error",
                  message: "User chat limit exceeded",
                });
                return;
              }
            }

            if (role === "pro") {
              const findProChat = await find("chatMessage", {
                role: "pro",
                chatId,
                userBooking,
                proBooking,
              });

              if (findProChat.length === 4) {
                socket.emit("chat_warning", {
                  status: "warning",
                  message:
                    "Reminder: You’ve used 4 messages out of your 7-message limit. Extend your chat now to continue beyond 7.",
                });
              }
              if (findProChat.length >= 7) {
                socket.emit("chat_error", {
                  status: "error",
                  message: "Pro chat limit exceeded",
                });
                return;
              }
            }
          }

        

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

       

          // emit message to chat room
          io.to("chatRoom").emit("message_sent", newMessage);
          io.to("chatRoom").emit("receive_message", newMessage);
        } catch (err) {
          socket.emit("chat_error", {
            status: "error",
            message: "An unexpected error occurred",
            error: err.message,
          });
        }
      }
    );

  

   
  });
};

export default handleSocket;