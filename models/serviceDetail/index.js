import mongoose from "mongoose";
import serviceDetailSchema from "./serviceDetailSchema.js";

const serviceDetail = mongoose.model("serviceDetail", serviceDetailSchema);

export default serviceDetail;
