export const proSockets = {
cancelledProBooking:  (io) => {
  // io.on("connection", (socket) => {
  //   console.log("[Socket] New connection on /cancelledProBooking:", socket.id);
  //  socket.on("join", (userId) => {
  //     socket.join(userId);
  //     console.log(`🟢 User ${userId} joined room.`);
  //   });

  //   // Client se event ka intezaar
  //   socket.on("cancel_pro_booking", (data) => {
  //     const { userId, proId } = data;

  //     const payload = {
  //       message: "Pro cancelled the booking.",
  //       userId,
  //       proId
    
  //     };

  //     console.log("🚫 Booking Cancelled by Pro:", payload);

  //     // Specific user room ko notify karein agar userId diya gaya hai
    
  //       io.to(userId).emit("proCancelBooking", payload);
  //       io.to(proId).emit("proCancelBooking", payload);
    
  //   });

  //   socket.on("disconnect", () => {
  //     console.log("[Socket] Disconnected from /cancelledProBooking:", socket.id);
  //   });
  // });



  
//   io.on("connection", (socket) => {
//   console.log("New socket connected:", socket.id);

//   socket.on("join_room", (roomName) => {
//   socket.join(roomName);
//   console.log(`Socket ${socket.id} joined room ${roomName}`);

// });

//   // Example: Send message to both User and Pro
//   socket.on("send_common_message", (message) => {
//     io.to(roomName).emit("common_message", message);
//   });
// });

 io.on("connection", (socket) => {
  console.log("New socket connected:", socket.id);

  socket.on("cancel_join_room", (roomName) => {
  socket.join(roomName);
  console.log(`Socket ${socket.id} joined room ${roomName}`);

});

  // Example: Send message to both User and Pro
  socket.on("proCancelBooking_message", (message) => {
    io.to("pro_cancel_join_room").emit("proCancelBooking", message);
  });
});
},


deliveredProBooking: (io) => {
// io.on("connection", (socket) => {
// console.log("[Socket] New connection on /deliveredProBooking:", socket.id);
// socket.emit("proDeliveredBooking", { message: "Pro delivered the service." });
// });
 io.on("connection", (socket) => {
  console.log("New socket connected:", socket.id);

  socket.on("proDelivered_join_room", (roomName) => {
  socket.join(roomName);
  console.log(`Socket ${socket.id} joined room ${roomName}`);

});

  // Example: Send message to both User and Pro
  socket.on("proDeliveredBooking_message", (message) => {
    io.to("pro_delivered_room").emit("proDeliveredBooking", message);
  });
});
},

proAcceptUserServiceRequest: (io) => {
// io.on("connection", (socket) => {
// console.log("[Socket] New connection on /proAcceptUserServiceRequest:", socket.id);
// socket.emit("proAcceptUserServiceRequest", { message: "Pro accepted the user's request." });
// });
 io.on("connection", (socket) => {
  console.log("New socket connected:", socket.id);

  socket.on("proAccept_join_room", (roomName) => {
  socket.join(roomName);
  console.log(`Socket ${socket.id} joined room ${roomName}`);

});

  // Example: Send message to both User and Pro
  socket.on("proAcceptBooking_message", (message) => {
    io.to("pro_Accept_room").emit("proAcceptBooking", message);
  });
});
},

unavailableSocket: (io) => {
// io.on("connection", (socket) => {
// console.log("[Socket] New connection on /proAcceptUserServiceRequest:", socket.id);
// socket.emit("proAcceptUserServiceRequest", { message: "Pro accepted the user's request." });
// });
 io.on("connection", (socket) => {
  console.log("New socket connected:", socket.id);

  socket.on("unAvailable_join_room", (roomName) => {
  socket.join(roomName);
  console.log(`Socket ${socket.id} joined room ${roomName}`);

});

  // Example: Send message to both User and Pro
  socket.on("unAvailable_message", (message) => {
    io.to("unAvailable_room").emit("unAvailableBooking", message);
  });
});
},

availabilitySocket: (io) => {
// io.on("connection", (socket) => {
// console.log("[Socket] New connection on /proAcceptUserServiceRequest:", socket.id);
// socket.emit("proAcceptUserServiceRequest", { message: "Pro accepted the user's request." });
// });
 io.on("connection", (socket) => {
  console.log("New socket connected:", socket.id);

  socket.on("availability_join_room", (roomName) => {
  socket.join(roomName);
  console.log(`Socket ${socket.id} joined room ${roomName}`);

});

  // Example: Send message to both User and Pro
  socket.on("availability_message", (message) => {
    io.to("availability_room").emit("availability", message);
  });
});
},


resheduleProAcceptBooking: (io) => {
io.on("connection", (socket) => {
console.log("[Socket] New connection on /resheduleProAcceptBooking:", socket.id);
socket.emit("resheduleProAcceptBooking", { message: "Pro accepted reschedule request." });
});
},

cancelledProRescheduleBooking: (io) => {
io.on("connection", (socket) => {
console.log("[Socket] New connection on /cancelledProRescheduleBooking:", socket.id);
socket.emit("cancelledProRescheduleBooking", { message: "Pro cancelled reschedule request." });
});
},

resheduleDeliveredProBooking: (io) => {
io.on("connection", (socket) => {
console.log("[Socket] New connection on /resheduleDeliveredProBooking:", socket.id);
socket.emit("proResheduleDeliveredBooking", { message: "Pro completed rescheduled service." });
});
},
};