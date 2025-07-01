import mongoose from "mongoose";
import userBookServSchema from "./userBookServiceSchema.js";

const userBookServ = mongoose.model("userBookServ", userBookServSchema);

export default userBookServ;
