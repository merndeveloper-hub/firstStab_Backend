import mongoose from "mongoose";
import schemaType from "../../types/index.js";


const addressSchema = new mongoose.Schema(
  {
    userId:{
     type: schemaType.TypeObjectId,
     ref: 'user'
    },
    address_Type: {
      type: schemaType.TypeString,
      enum:['work','other','home']
    },
    address_line1: {
      type: schemaType.TypeString,
    },
    address_line2: {
      type: schemaType.TypeString,
    },
    state: {
      type: schemaType.TypeString,
    },
    city: {
      type: schemaType.TypeString,
    },
    zipCode: {
      type: schemaType.TypeString,
    },
    mobile: {
      type: schemaType.TypeString
    },
    created_date: {
      type: schemaType.TypeDate,
      default: Date.now,
    },
  },
  { timestamps: true }
);

export default addressSchema;
