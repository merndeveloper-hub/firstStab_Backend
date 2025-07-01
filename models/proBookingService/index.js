import mongoose from "mongoose";
import proBookingServiceSchema from "./proBookingServiceSchema.js";

//const booking = mongoose.model("booking", bookingSchema);
const proBookingService = mongoose.model('proBookingService', proBookingServiceSchema);

export default proBookingService;
