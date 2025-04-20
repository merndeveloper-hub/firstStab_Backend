import mongoose from "mongoose";
import proCategorySchema from "./proCategorySchema.js";

const proCategory = mongoose.model("proCategory", proCategorySchema);

export default proCategory;
