import { userSockets } from './userSocket.js';
import { proSockets } from './proSocket.js';

export const registerAllSockets = (io) => {
userSockets.userBookReqSocket(io.of("/api/v1/userBookReqSocket"));
userSockets.cancelledBooking(io.of("/api/v1/userCancelledBooking"));
userSockets.completedBooking(io.of("/api/v1/userCompletedBooking"));
userSockets.userAcceptProServiceRequest(io.of("/api/v1/userAcceptProServiceRequest"));
userSockets.userResheduleRequest(io.of("/api/v1/userResheduleRequest"));
userSockets.resheduleAcceptBooking(io.of("/api/v1/userResheduleAccept"));
userSockets.cancelledRescheduleBooking(io.of("/api/v1/userCancelledReschedule"));

proSockets.cancelledProBooking(io.of("/api/v1/proCancelledBooking"));
proSockets.deliveredProBooking(io.of("/api/v1/proDeliveredBooking"));
proSockets.proAcceptUserServiceRequest(io.of("/api/v1/proAcceptUserRequest"));
proSockets.resheduleProAcceptBooking(io.of("/api/v1/proResheduleAccept"));
proSockets.cancelledProRescheduleBooking(io.of("/api/v1/proCancelledReschedule"));
proSockets.resheduleDeliveredProBooking(io.of("/api/v1/proResheduleDelivered"));
proSockets.unavailableSocket(io.of("/api/v1/unAvailable"))
};