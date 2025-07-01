import mongoose from "mongoose";
import faqCategorySchema from"./faqCategorySchema.js";

const faqCategory = mongoose.model("faqCategory", faqCategorySchema);

export default faqCategory;
