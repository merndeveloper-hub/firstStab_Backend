import mongoose from "mongoose";
import schemaType from "../../types/index.js";

const reviewSchema = new mongoose.Schema(
  {
    userId: { type: schemaType.TypeObjectId, ref: "user" },
    professsionalId: { type: schemaType.TypeObjectId, ref: "user" },
    bookServiceId: { type: schemaType.TypeObjectId, ref: "userBookServ" },
    proServiceId: { type: schemaType.TypeObjectId, ref: "proCategory" },
    commit: { type: schemaType.TypeString },
    reviewStar: { type: schemaType.TypeNumber },
    serviceType: {
      type: schemaType.TypeString,
      enum: ["isChat", "isVirtual", "isRemote", "isInPerson"],
      //required: true,
    },

    created_date: {
      type: schemaType.TypeDate,
      default: Date.now,
    },
  },
  { timestamps: true }
);

export default reviewSchema;
