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
     paypalFixedFee: {
      type: schemaType.TypeNumber,
    },
    paypalFeePercentage: {
      type: schemaType.TypeNumber,
    },

     currency: {
      type: schemaType.TypeString,
    },
     status: { type: schemaType.TypeString, enum: ['Active', 'InActive'], default: 'Active' },
    created_date: {
      type: schemaType.TypeDate,
      default: Date.now,
    },
  },
  { timestamps: true }
);

export default adminFeesSchema;


//export const ApiLog = mongoose.model("ApiLog", apiLogSchema);
