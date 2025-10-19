import mongoose from "mongoose";
import reportQuerySchema from"./reportQueryScchema.js";

const reportQuery = mongoose.model("reportQuery", reportQuerySchema);

export default reportQuery;
