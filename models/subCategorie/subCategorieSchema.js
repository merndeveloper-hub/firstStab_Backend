import mongoose from "mongoose";
import schemaType from "../../types/index.js";


const subCategorySchema = new mongoose.Schema({
  categoryId: { type: schemaType.TypeObjectId, ref: 'category', required: true },
  categoryName: { type: schemaType.TypeString },
  name: { type: schemaType.TypeString, required: true },
  image: { type: schemaType.TypeString, required: true },
  icon: { type: schemaType.TypeString, required: true },
  complexity_tier: { type: schemaType.TypeString, enum: ["moderate","complex","simple"], required: true },
  price_model: { type: schemaType.TypeString,enum:["fixed","range","quote_only"], required: true },
  fixed_price: { type: schemaType.TypeString },
  min_price: { type: schemaType.TypeString },
  max_price: { type: schemaType.TypeString },
  isRemote: { type: schemaType.TypeBoolean,default: false},
  isChat: { type: schemaType.TypeBoolean,default: false},
  isVirtual: { type: schemaType.TypeBoolean,default: false},
  isInPerson: { type: schemaType.TypeBoolean,default: false},
  commission: { type: schemaType.TypeNumber },
  description: { type: schemaType.TypeString, required: true },
  addToHome: { type: schemaType.TypeString, enum: ['Yes', 'No'], default: 'No' },
  status: { type: schemaType.TypeString, enum: ['Active', 'InActive'], default: 'Active' },
  serviceCountry: { type: schemaType.TypeString, enum: ['US','Both'], default: 'US' },
   bgServiceName: { type: schemaType.TypeString, enum: ['checkr','Both'], default: 'checkr' },
   bgPackageName: { type: schemaType.TypeString},
    bgValidation:{ type: schemaType.TypeArray },
   created_date: {
        type: schemaType.TypeDate,
        default: Date.now,
      },
},{ timestamps: true });

export default subCategorySchema;


