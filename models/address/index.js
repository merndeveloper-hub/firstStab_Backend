import mongoose from "mongoose";
import addressSchema from"./addressSchema.js";

const address = mongoose.model("address", addressSchema);

export default address;
