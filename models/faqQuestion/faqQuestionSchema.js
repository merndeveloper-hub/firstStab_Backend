import mongoose from "mongoose";
import schemaType from "../../types/index.js";


const faqQuestionSchema = new mongoose.Schema({
  title: { type: schemaType.TypeString },
  answer: { type: schemaType.TypeString },
  displayPostion: { type: schemaType.TypeNumber },
  faqCategorieName: { type: schemaType.TypeString },
  faqCategorieId: { type: schemaType.TypeObjectId ,ref:"faqCategory"},
  status: { type: schemaType.TypeString, enum: ['Active', 'InActive'], default: 'Active' },
 
   created_date: {
        type: schemaType.TypeDate,
        default: Date.now,
      },
},{ timestamps: true });

export default faqQuestionSchema;