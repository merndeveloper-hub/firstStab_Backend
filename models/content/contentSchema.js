import mongoose from "mongoose";
import schemaType from "../../types/index.js";


const contentSchema = new mongoose.Schema({
  title: { type: schemaType.TypeString},
  pageCode: { type: schemaType.TypeNumber},
  image: { type: schemaType.TypeString},
  contents: { type: schemaType.TypeString},
  status: { type: schemaType.TypeString, enum: ['Active', 'Inactive'], default: 'Active' },
  isSystemPage: { type: schemaType.TypeString, enum: ['No', 'Yes'], default: 'No' },
   created_date: {
        type: schemaType.TypeDate,
        default: Date.now,
      },
},{ timestamps: true });

export default contentSchema;