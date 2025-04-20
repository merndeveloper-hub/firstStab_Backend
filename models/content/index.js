import mongoose from "mongoose";
import contentSchema from"./contentSchema.js";

const content = mongoose.model("content", contentSchema);

export default content;
