import mongoose from "mongoose";
import subCategorySchema from"./subCategorieSchema.js";

const subCategory = mongoose.model("subCategory", subCategorySchema);

export default subCategory;
