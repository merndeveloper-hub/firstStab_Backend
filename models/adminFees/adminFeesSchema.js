import mongoose from "mongoose";
import schemaType from "../../types/index.js";

const adminFeesSchema = new mongoose.Schema(
  {
    
    registerationFees: {
      type: schemaType.TypeNumber,
    },
    platformFees: {
      type: schemaType.TypeNumber,
    },
     currency: {
      type: schemaType.TypeString,
    },
    created_date: {
      type: schemaType.TypeDate,
      default: Date.now,
    },
  },
  { timestamps: true }
);

export default adminFeesSchema;


//export const ApiLog = mongoose.model("ApiLog", apiLogSchema);
