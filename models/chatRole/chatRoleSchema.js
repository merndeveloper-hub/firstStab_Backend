import mongoose from "mongoose";
import schemaType from "../../types/index.js";


const chatRoleSchema = new mongoose.Schema(
  {
    name:{
     type: schemaType.TypeString,
     //ref: 'user'
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

export default chatRoleSchema;
