export const userSockets = {
userBookReqSocket: (io) => {
io.on("connection", (socket) => {
console.log("[Socket] New connection on /userBookReqSocket:", socket.id);
socket.emit("userBooking", { message: "User has requested a service." });
});
},

cancelledBooking: (io) => {
io.on("connection", (socket) => {
console.log("[Socket] New connection on /cancelledBooking:", socket.id);
socket.emit("userCancelBooking", { message: "User has cancelled the booking." });
});
},

completedBooking: (io) => {
io.on("connection", (socket) => {
console.log("[Socket] New connection on /completedBooking:", socket.id);
socket.emit("userCompleteBooking", { message: "User has completed the booking." });
});
},

userAcceptProServiceRequest: (io) => {
io.on("connection", (socket) => {
console.log("[Socket] New connection on /userAcceptProServiceRequest:", socket.id);
socket.emit("userAcceptProServiceRequest", { message: "User accepted the Pro's request." });
});
},

userResheduleRequest: (io) => {
io.on("connection", (socket) => {
console.log("[Socket] New connection on /userResheduleRequest:", socket.id);
socket.emit("userResheduleRequest", { message: "User requested reschedule." });
});
},

resheduleAcceptBooking: (io) => {
io.on("connection", (socket) => {
console.log("[Socket] New connection on /resheduleAcceptBooking:", socket.id);
socket.emit("resheduleAcceptBooking", { message: "User accepted reschedule." });
});
},

cancelledRescheduleBooking: (io) => {
io.on("connection", (socket) => {
console.log("[Socket] New connection on /cancelledRescheduleBooking:", socket.id);
socket.emit("cancelledRescheduleBooking", { message: "User cancelled the reschedule." });
});
},
};