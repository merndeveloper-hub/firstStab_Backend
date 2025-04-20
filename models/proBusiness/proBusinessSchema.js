import mongoose from "mongoose";
import schemaType from "../../types/index.js";

const proBusinSchema = new mongoose.Schema(
  {
    userId: {
      type: schemaType.ObjectID,
      ref: "user",
      required: true,
    },
    name: {
      type: schemaType.TypeString,
      required: true,
    },
    address: {
      type: schemaType.TypeString,
      required: true,
    },
    phoneNo: {
      type: schemaType.TypeString,
      required: true,
    },
  },
  { timestamps: true }
);

export default proBusinSchema;
