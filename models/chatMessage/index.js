import mongoose from "mongoose";
import chatMessageSchema from"./chatMessageSchema.js";

const chatMessage = mongoose.model("chatMessage", chatMessageSchema);

export default chatMessage;
