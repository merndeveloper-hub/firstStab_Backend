import mongoose from "mongoose";
import schemaType from "../../types/index.js";

const serviceDetailSchema = new mongoose.Schema(
  {
    userId: { type: schemaType.TypeObjectId, ref: "user" },
    professsionalId: { type: schemaType.TypeObjectId, ref: "user" },
    bookServiceId: { type: schemaType.TypeObjectId, ref: "userBookServ" },
    proServiceId: { type: schemaType.TypeObjectId, ref: "proCategory" },
    reason: { type: schemaType.TypeString },
    videoRoomName: { type: schemaType.TypeString },
    serviceType: {
      type: schemaType.TypeString,
      enum: ["isChat", "isVirtual", "isRemote", "isInPerson"],
      //required: true,
    },
    chatChannelName: { type: schemaType.TypeString },
    token: { type: schemaType.TypeString },
    orderStatusRemarks: { type: schemaType.TypeString },
    orderCancelRemarks: { type: schemaType.TypeString },
    created_date: {
      type: schemaType.TypeDate,
      default: Date.now,
    },
    status: {
      type: schemaType.TypeString,
      default: "Booked",
    },
  },
  { timestamps: true }
);

export default serviceDetailSchema;
