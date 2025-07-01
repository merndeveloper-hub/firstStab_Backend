import mongoose from "mongoose";
import schemaType from "../../types/index.js";


const chatSchema = new mongoose.Schema(
  {
    participants: [{
         type: schemaType.TypeObjectId,
         ref: "chatRole",
       }],
       lastMessage: {
         type: schemaType.TypeObjectId,
         ref: "chatMessage",
       },
       updatedAt: {
        type: schemaType.TypeDate,
        default: Date.now,
      },
       
    created_date: {
      type: schemaType.TypeDate,
      default: Date.now,
    },
  },
  { timestamps: true }
);

export default chatSchema;

