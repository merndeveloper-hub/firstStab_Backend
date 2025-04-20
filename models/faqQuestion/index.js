import mongoose from "mongoose";
import faqQuestionSchema from"./faqQuestionSchema.js";

const faqQuestion = mongoose.model("faqQuestion", faqQuestionSchema);

export default faqQuestion;
