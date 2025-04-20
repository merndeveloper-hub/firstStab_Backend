import mongoose from "mongoose";
import contactUsSchema from "./contactUs.js";

const contactUs = mongoose.model("contactUs", contactUsSchema);

export default contactUs;
