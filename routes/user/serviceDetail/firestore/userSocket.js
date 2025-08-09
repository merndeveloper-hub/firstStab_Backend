export const userSockets = {
userBookReqSocket: (io) => {
// io.on("connection", (socket) => {
// console.log("[Socket] New connection on /userBookReqSocket:", socket.id);
// socket.emit("userBooking", { message: "User has requested a service." });
// });
io.on("connection", (socket) => {
  console.log("New socket connected:", socket.id);

  socket.on("userRequest_join_room", (roomName) => {
  socket.join(roomName);
  console.log(`Socket ${socket.id} joined room ${roomName}`);

});

  // Example: Send message to both User and Pro
  socket.on("userRequestedBooking_message", (message) => {
    io.to("user_Requested_room").emit("userRequestedBooking", message);
  });
});

},

cancelledBooking: (io) => {
// io.on("connection", (socket) => {
// console.log("[Socket] New connection on /cancelledBooking:", socket.id);
// socket.emit("userCancelBooking", { message: "User has cancelled the booking." });
// });

io.on("connection", (socket) => {
  console.log("New socket connected:", socket.id);

  socket.on("userCancel_join_room", (roomName) => {
  socket.join(roomName);
  console.log(`Socket ${socket.id} joined room ${roomName}`);

});

  // Example: Send message to both User and Pro
  socket.on("userCancelledBooking_message", (message) => {
    io.to("user_Cancelled_room").emit("userCancelledBooking", message);
  });
});
},

completedBooking: (io) => {
// io.on("connection", (socket) => {
// console.log("[Socket] New connection on /completedBooking:", socket.id);
// socket.emit("userCompleteBooking", { message: "User has completed the booking." });
// });
io.on("connection", (socket) => {
  console.log("New socket connected:", socket.id);

  socket.on("userComplete_join_room", (roomName) => {
  socket.join(roomName);
  console.log(`Socket ${socket.id} joined room ${roomName}`);

});

  // Example: Send message to both User and Pro
  socket.on("userCompletedBooking_message", (message) => {
    io.to("user_Completed_room").emit("userCompletedBooking", message);
  });
});
},

userAcceptProServiceRequest: (io) => {

io.on("connection", (socket) => {
  console.log("New socket connected:", socket.id);

  socket.on("userAccept_join_room", (roomName) => {
  socket.join(roomName);
  console.log(`Socket ${socket.id} joined room ${roomName}`);

});

  // Example: Send message to both User and Pro
  socket.on("userAcceptedBooking_message", (message) => {
    io.to("user_Accepted_room").emit("userAcceptedBooking", message);
  });
});
},

userResheduleRequest: (io) => {

io.on("connection", (socket) => {
  console.log("New socket connected:", socket.id);

  socket.on("userResheduleRequest_join_room", (roomName) => {
  socket.join(roomName);
  console.log(`Socket ${socket.id} joined room ${roomName}`);

});

  // Example: Send message to both User and Pro
  socket.on("userResheduleRequest_message", (message) => {
    io.to("userResheduleRequest_room").emit("userResheduleRequest", message);
  });
});
},

resheduleAcceptBooking: (io) => {


io.on("connection", (socket) => {
  console.log("New socket connected:", socket.id);

  socket.on("userResheduleAccept_join_room", (roomName) => {
  socket.join(roomName);
  console.log(`Socket ${socket.id} joined room ${roomName}`);

});

  // Example: Send message to both User and Pro
  socket.on("userResheduleAccept_message", (message) => {
    io.to("userResheduleAccept_room").emit("userResheduleAccept", message);
  });
});
},

cancelledRescheduleBooking: (io) => {


io.on("connection", (socket) => {
  console.log("New socket connected:", socket.id);

  socket.on("userResheduleCancel_join_room", (roomName) => {
  socket.join(roomName);
  console.log(`Socket ${socket.id} joined room ${roomName}`);

});

  // Example: Send message to both User and Pro
  socket.on("userResheduleCancel_message", (message) => {
    io.to("userResheduleCancel_room").emit("userResheduleCancel", message);
  });
});
},
};