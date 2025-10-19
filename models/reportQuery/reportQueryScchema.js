import mongoose from "mongoose";
import schemaType from "../../types/index.js";


const reportQuerySchema = new mongoose.Schema(
  {
    email:{
     type: schemaType.TypeString,
     //ref: 'user'
    },
    queryType:{
     type: schemaType.TypeString,
     //ref: 'user'
    },
    querySuggestion:{
     type: schemaType.TypeString,
     //ref: 'user'
    },
    message:{
     type: schemaType.TypeString,
     //ref: 'user'
    },
    reqId:{
     type: schemaType.TypeString,
     //ref: 'user'
    },
    id:{
     type: schemaType.TypeObjectId,
     ref: 'user'
    },
    role: {
      type: schemaType.TypeString,
     // enum: ['user', 'pro']
    },
    created_date: {
      type: schemaType.TypeDate,
      default: Date.now,
    },
  },
  { timestamps: true }
);

export default reportQuerySchema;
