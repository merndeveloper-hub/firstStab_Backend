import mongoose from "mongoose";
import categorySchema from"./categorieSchema.js";

const category = mongoose.model("category", categorySchema);

export default category;
