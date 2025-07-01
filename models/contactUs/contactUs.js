import mongoose from "mongoose";
import schemaType from "../../types/index.js";

const contactUs = new mongoose.Schema({

  userId: {
    type: schemaType.ObjectID, 
   ref:"user",
  },
  fullName: {
    type: schemaType.TypeString,
  },
  phoneNumber: {
    type: schemaType.TypeString, 
  },
  email: {
    type: schemaType.TypeString, 
  },
  subject: {
    type: schemaType.TypeString, 
  
    required: true,
  },
  message: {
    type: schemaType.TypeString, 
    required: true,
  },
  },
  { timestamps: true }
);

export default contactUs;


