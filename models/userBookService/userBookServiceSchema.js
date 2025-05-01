import mongoose from "mongoose";
import schemaType from "../../types/index.js";

const userBookServSchema = new mongoose.Schema(
  {
    userId: {
      type: schemaType.ObjectID,
      ref: "user",
      // required: true,
    },
    addressId: {
      type: schemaType.ObjectID,
      ref: "address",
    },
      inPersonOTP:{
              type: schemaType.TypeString
            },
    requestId: {
      type: schemaType.TypeString,
      deafult: 0,
      // required: true,
    },
    cancelledReason: {
      type: schemaType.TypeString,
      default: "",
    },
     orderRatingPending: {
           type: schemaType.TypeString,
                default: "Yes",
        },
    // serviceType: {
    //   type: schemaType.TypeString,
    //   enum: ["isChat", "isVirtual", "isRemote", "inInPerson"],
    //   // required: true,
    // },
    serviceName: {
      type: schemaType.TypeString,

      //required: true,
    },
    typeOfWork: {
      type: schemaType.TypeString,

      // required: true,
    },
 

    StartedTime: { type: schemaType.TypeString, default: null },
    FinishedTime: { type: schemaType.TypeString, default: null },
    CancelDateTime: { type: schemaType.TypeString, default: null },
    CancelCharges: { type: schemaType.TypeNumber, default: 0.0 },

    CancelSlot: { type: schemaType.TypeNumber, default: 0 },
    refundAmount: { type: schemaType.TypeNumber, default: 0 },
    ExtendedTime: { type: schemaType.TypeString, default: "" },
    ExtensionCharges: { type: schemaType.TypeNumber, default: 0.0 },

    quoteCount: {
      type: schemaType.TypeNumber,
      default: 0,
    },
    refundableAmount: {
      type: schemaType.TypeNumber,
    },

    serviceAssign: {
      type: schemaType.TypeString,
      enum: ["Professional", "Random"],
      default: "Random",
    },
    status: {
      type: schemaType.TypeString,
      enum: [
        "Cancelled",
        "Accepted",
        "Rejected",
        "Pending",
        "Requested",
        "Completed",
        "OnGoing",
        "Delivered"
      ],
      default: "Pending",
    },

 orderRescheduleStatus: {
      type: schemaType.TypeString,
      default: "NA",
    },  orderRescheduleStartTime: {
      type: schemaType.TypeString,
      default: "",
    
    },  orderRescheduleDate: {
      type: schemaType.TypeString,
      default: "",
    },  orderExtendStatus: {
      type: schemaType.TypeString,
      default: "",
    },  orderExtendEndTime: {
      type: schemaType.TypeString,
      default: "",
    }, 
    orderRescheduleEndDate: {
          type: schemaType.TypeString,
          default: "",
        },
    orderRescheduleRequest: {
      type: schemaType.TypeString,
      default: "NA",
    },
    reasonCancel: {
      type: schemaType.TypeString,
      enum: [
        "Change of Plans",
        "Delayed Need",
        "Emergency Situation",
        "Financial Reasons",
        "Found an Alternative Solution",
        "No Show",
        "Others",
        "Rescheduling",
        "Schedule Conflict",
        "Service No Longer Needed",
        "Unsatisfactory Provider Options",
      ],
    },
    reasonDescription: {
      type: schemaType.TypeString,
    },
    media: {
      type: schemaType.TypeArray,
    },
    serviceImage: {
      type: schemaType.TypeArray,
    },
    problemDescription: {
      type: schemaType.TypeString,
      //required: true,
    },
    professionalId: {
      type: schemaType.ObjectID,
      ref: "user",
    },
    proServiceId: {
      type: schemaType.ObjectID,
      ref: "proCategory",
    },
    proBookingServiceId: {
      type: schemaType.ObjectID,
      ref: "proBookingService",
    },
    categoryId: {
      type: schemaType.ObjectID, // Reference to Category
      ref: "category",
      //  required: true,
    },
    subCategories: {
      id: {
        type: schemaType.ObjectID, // Reference to SubCategory
        ref: "subCategory",
        //   required: true,
      },
      serviceType: { type: schemaType.TypeString,enum: ["isChat", "isVirtual", "isRemote", "isInPerson"] },
      orderStartDate: { type: schemaType.TypeString },
      orderStartTime: { type: schemaType.TypeString },
      orderEndDate: { type: schemaType.TypeString },
      orderEndTime: { type: schemaType.TypeString },
    },
  videoRoomName:{
      type:schemaType.TypeString,

     } ,
     chatChannelName: { type: schemaType.TypeString },
    createdAt: {
      type: schemaType.TypeDate,
      default: Date.now,
    },
  },

  { timestamps: true }
);

export default userBookServSchema;
