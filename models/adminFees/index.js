import mongoose from "mongoose";
import adminFeesSchema from"./adminFeesSchema.js";

const adminFees = mongoose.model("adminFees", adminFeesSchema);

export default adminFees;
