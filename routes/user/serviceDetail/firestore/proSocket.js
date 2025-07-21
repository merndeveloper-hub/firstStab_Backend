export const proSockets = {
cancelledProBooking:  (io) => {
  io.on("connection", (socket) => {
    console.log("[Socket] New connection on /cancelledProBooking:", socket.id);

    // Client se event ka intezaar
    socket.on("cancel_pro_booking", (data) => {
      const { userId, proId } = data;

      const payload = {
        message: "Pro cancelled the booking.",
        userId,
        proId
    
      };

      console.log("🚫 Booking Cancelled by Pro:", payload);

      // Specific user room ko notify karein agar userId diya gaya hai
    
        io.to(userId).emit("proCancelBooking", payload);
        io.to(proId).emit("proCancelBooking", payload);
    
    });

    socket.on("disconnect", () => {
      console.log("[Socket] Disconnected from /cancelledProBooking:", socket.id);
    });
  });
},


deliveredProBooking: (io) => {
io.on("connection", (socket) => {
console.log("[Socket] New connection on /deliveredProBooking:", socket.id);
socket.emit("proDeliveredBooking", { message: "Pro delivered the service." });
});
},

proAcceptUserServiceRequest: (io) => {
io.on("connection", (socket) => {
console.log("[Socket] New connection on /proAcceptUserServiceRequest:", socket.id);
socket.emit("proAcceptUserServiceRequest", { message: "Pro accepted the user's request." });
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