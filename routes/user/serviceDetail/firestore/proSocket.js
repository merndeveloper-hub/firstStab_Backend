export const proSockets = {
cancelledProBooking:  (io) => {
 

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

quoteAmountProBooking: (io) => {

 io.on("connection", (socket) => {
  console.log("New socket connected:", socket.id);

  socket.on("proQuoteAmount_join_room", (roomName) => {
  socket.join(roomName);
  console.log(`Socket ${socket.id} joined room ${roomName}`);

});

  // Example: Send message to both User and Pro
  socket.on("proQuoteAmountBooking_message", (message) => {
    io.to("pro_quoteAmount_room").emit("proQuoteAmountBooking", message);
  });
});
},

proAcceptUserServiceRequest: (io) => {

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


resheduleDeliveredProBooking: (io) => {

io.on("connection", (socket) => {
  console.log("New socket connected:", socket.id);

  socket.on("proResheduleDeliverd_join_room", (roomName) => {
  socket.join(roomName);
  console.log(`Socket ${socket.id} joined room ${roomName}`);

});

  // Example: Send message to both User and Pro
  socket.on("proResheduleDeliverd_message", (message) => {
    io.to("proResheduleDeliverd_room").emit("proResheduleDeliverd", message);
  });
});
},

resheduleProAcceptBooking: (io) => {


io.on("connection", (socket) => {
  console.log("New socket connected:", socket.id);

  socket.on("proResheduleAccept_join_room", (roomName) => {
  socket.join(roomName);
  console.log(`Socket ${socket.id} joined room ${roomName}`);

});

  // Example: Send message to both User and Pro
  socket.on("proResheduleAccept_message", (message) => {
    io.to("proResheduleAccept_room").emit("proResheduleAccept", message);
  });
});
},

cancelledProRescheduleBooking: (io) => {


io.on("connection", (socket) => {
  console.log("New socket connected:", socket.id);

  socket.on("proResheduleCancel_join_room", (roomName) => {
  socket.join(roomName);
  console.log(`Socket ${socket.id} joined room ${roomName}`);

});

  // Example: Send message to both User and Pro
  socket.on("proResheduleCancel_message", (message) => {
    io.to("proResheduleCancel_room").emit("proResheduleCancel", message);
  });
});
},


extendProAcceptBooking: (io) => {


io.on("connection", (socket) => {
  console.log("New socket connected:", socket.id);

  socket.on("proExtendAccept_join_room", (roomName) => {
  socket.join(roomName);
  console.log(`Socket ${socket.id} joined room ${roomName}`);

});

  // Example: Send message to both User and Pro
  socket.on("proExtendAccept_message", (message) => {
    io.to("proExtendAccept_room").emit("proExtendAccept", message);
  });
});
},

cancelledProExtendBooking: (io) => {


io.on("connection", (socket) => {
  console.log("New socket connected:", socket.id);

  socket.on("proExtendCancel_join_room", (roomName) => {
  socket.join(roomName);
  console.log(`Socket ${socket.id} joined room ${roomName}`);

});

  // Example: Send message to both User and Pro
  socket.on("proExtendCancel_message", (message) => {
    io.to("proExtendCancel_room").emit("proExtendCancel", message);
  });
});
}



};



