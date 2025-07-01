import mongoose from "mongoose";
import chatRoleSchema from"./chatRoleSchema.js";

const chatRole = mongoose.model("chatRole", chatRoleSchema);

export default chatRole;
