import mongoose from "mongoose";
import chatSchema from"./chatSchema.js";

const chat = mongoose.model("chat", chatSchema);

export default chat;
