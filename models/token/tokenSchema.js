import mongoose from "mongoose";
import SchemaType from "../../types/index.js";

const tokenSchema = new mongoose.Schema(
  {
    user_id: {
      type: SchemaType.ObjectID,
      ref: "user",
      required: true,
    },
    token: {
      type: SchemaType.TypeString,
      required: true,
      unique: true
    },
    expiresAt: {
      type: SchemaType.TypeDate,
    },
    type: {
      type: SchemaType.TypeString,
      enum: ['access', 'refresh'],
      required: true
    }
  },
  { timestamps: true }
);



export default tokenSchema;


