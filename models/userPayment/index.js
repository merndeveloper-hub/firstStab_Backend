import mongoose from "mongoose";
import userPaymentSchema from "./userPaymentSchema.js";

const userPayment = mongoose.model("userPayment", userPaymentSchema);

export default userPayment;
