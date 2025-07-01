import mongoose from "mongoose";
import schemaType from "../../types/index.js";


const categorySchema = new mongoose.Schema({
  name: { type: schemaType.TypeString, required: true },
  image: { type: schemaType.TypeString, required: true },
  icon: { type: schemaType.TypeString, required: true },
 // commission: { type: schemaType.TypeNumber, required: true },
  taxCode: { type: schemaType.TypeString,required: true },
  description: { type: schemaType.TypeString, default: '' },
  status: { type: schemaType.TypeString, enum: ['Active', 'InActive'], default: 'Active' },
  serviceCountry: { type: schemaType.TypeString, enum: ['US','Both'], default: 'US' },
  isRemote: { type: schemaType.TypeString, enum: ['No', 'Yes'], default: 'No' },
  addToHome: { type: schemaType.TypeString, enum: ['default', 'Top left', 'Top Right', 'bottom'], default: 'default' }, 
   created_date: {
        type: schemaType.TypeDate,
        default: Date.now,
      },
},{ timestamps: true });

export default categorySchema;

