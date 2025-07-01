import mongoose from "mongoose";
import bookingDetailsSchema from "./bookingDetailSchema.js";

//const booking = mongoose.model("booking", bookingSchema);
const bookingDetail = mongoose.model('bookingDetail', bookingDetailsSchema);

export default bookingDetail;
