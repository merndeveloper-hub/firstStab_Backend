import mongoose from "mongoose";
import schemaType from "../../types/index.js";

const chatMessageSchema = new mongoose.Schema(
  {
    chatId: {
      type: schemaType.TypeString,
    //  ref: "chat",
    },
    senderId: {
      type: schemaType.TypeString,
    //  ref: "chatRole",
    },
    receiverId: {
      type: schemaType.TypeString,
     // ref: "chatRole",
    },
    message: {
      type: schemaType.TypeString,
    },
    isRead: {
      type: schemaType.TypeBoolean,
      default: false,
    },
    timestamp: {
      type: schemaType.TypeDate,
      default: Date.now,
    },
     role: {
          type: schemaType.TypeString,
          enum: ['user', 'pro']
        },
    created_date: {
      type: schemaType.TypeDate,
      default: Date.now,
    },
  },
  { timestamps: true }
);

export default chatMessageSchema;
