import mongoose from "mongoose";
import reviewSchema from "./reviewSchema.js";

const review = mongoose.model("review", reviewSchema);

export default review;
