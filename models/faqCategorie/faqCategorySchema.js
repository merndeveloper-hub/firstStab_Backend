import mongoose from "mongoose";
import schemaType from "../../types/index.js";


const faqCategorySchema = new mongoose.Schema({
  name: { type: schemaType.TypeString },
  status: { type: schemaType.TypeString, enum: ['Active', 'InActive'], default: 'Active' },
   created_date: {
        type: schemaType.TypeDate,
        default: Date.now,
      },
},{ timestamps: true });

export default faqCategorySchema;