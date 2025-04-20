import mongoose from "mongoose";
import PaymentSchema from "./paymentSchema.js";

const payment = mongoose.model("payment", PaymentSchema);

export default payment;
