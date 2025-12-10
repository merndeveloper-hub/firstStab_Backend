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
    inPersonOTP: {
      type: schemaType.TypeString,
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
      ProfessionalPayableAmount: { type: schemaType.TypeNumber },
       userPayableAmount: { type: schemaType.TypeNumber },
   CancellationChargesApplyTo: { type: schemaType.TypeString, enum:['pro','user'] },
   RefundableAmount: { type: schemaType.TypeNumber, default: 0.00 },
   amountToReturn:{ type: schemaType.TypeString, enum:['pro','user']  },
   priceToReturn:{ type: schemaType.TypeNumber },
    orderRatingPending: {
      type: schemaType.TypeString,
      default: "Yes",
    },
    // ✅ Timezone fields
      timezone: {
        type: schemaType.TypeString,
        //required: true,
        default: "UTC",
        description: "User's timezone when booking was created"
      },
       amountReturn: {
            type: schemaType.TypeString,
           // deafult: 0,
            //  required: true,
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
    FinishedDate: { type: schemaType.TypeString, default: null },
    CancelDate: { type: schemaType.TypeString, default: null },
    CancelTime: { type: schemaType.TypeString, default: null },
    CancelCharges: { type: schemaType.TypeNumber, default: 0.0 },
    complexity_tier: {
      type: schemaType.TypeString,
      enum: ["moderate", "complex", "simple"],
      required: true,
    },
    price_model: {
      type: schemaType.TypeString,
      enum: ["fixed", "range", "quote_only"],
      required: true,
    },
    fixed_price: { type: schemaType.TypeString },
    min_price: { type: schemaType.TypeString },
    max_price: { type: schemaType.TypeString },
    range_price:{ type: schemaType.TypeString },
    CancelSlot: { type: schemaType.TypeNumber, default: 0 },
    refundAmount: { type: schemaType.TypeNumber, default: 0 },
    ExtendedTime: { type: schemaType.TypeString, default: "" },
    ExtensionCharges: { type: schemaType.TypeNumber, default: 0.0 },
  platformFees: {
          type: schemaType.TypeNumber,
        }, 
         paypalFixedFee: {
          type: schemaType.TypeNumber,
        },
        paypalFeePercentage: {
          type: schemaType.TypeNumber,
        },
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
        "Delivered",
        "Confirmed",
        "Unavailable",
      ],
      default: "Pending",
    },

    orderRescheduleStatus: {
      type: schemaType.TypeString,
      default: "NA",
    },
    orderRescheduleStartTime: {
      type: schemaType.TypeString,
      default: "",
    },
    orderRescheduleStartDate: {
      type: schemaType.TypeString,
      default: "",
    },
    orderExtendStatus: {
      type: schemaType.TypeString,
      default: "NA",
    },
    orderExtendEndTime: {
      type: schemaType.TypeString,
      default: "NA",
    },
    orderRescheduleEndTime: {
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
          orderRescheduleReason: {
          type: schemaType.TypeString,
          default: "NA",
        },
          orderRescheduleNumber: {
          type: schemaType.TypeString,
          default: "NA",
        },
   reasonCancel: {
  type: schemaType.TypeString,
  enum: [
    // User side reasons
    "Change of Plans",
    "Delayed Need",
    "Emergency Situation",
    "Financial Reasons",
    "Found an Alternative Solution",
    "Schedule Conflict",
    "Service No Longer Needed",
    "Unsatisfactory Provider Options",
    "Booking Time End",
    "Rescheduling",

    // Pro side reasons
    "Provider No Show",          // Pro meeting mein nahi aaya
    "Provider Delayed",          // Pro late ho gaya
    "Provider Cancelled",        // Pro ne khud cancel kiya
    "Provider Double Booked",    // Pro ne ek hi waqt pe multiple bookings le li

    // User side specific
    "User No Show",              // User meeting mein nahi aaya
    "User Cancelled",            // User ne khud cancel kiya
    "User Did Not Respond",      // User ne timely response nahi diya

    // Platform / Technical
    "Technical Issues",          // App/connection/technical problem
    "Payment Issues",            // Payment fail ya refund related
    "Verification Issues",       // Background check / KYC failure
    "Policy Violation",          // Rules breach hone ki wajah se cancel

    // Generic
    "Others"
  ]
},
total_amount_cus_pay_with_charges: { type: schemaType.TypeNumber },
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
      serviceType: {
        type: schemaType.TypeString,
        enum: ["isChat", "isVirtual", "isRemote", "isInPerson"],
      },
      orderStartDate: { type: schemaType.TypeString },
      orderStartTime: { type: schemaType.TypeString },
      orderEndDate: { type: schemaType.TypeString },
      orderEndTime: { type: schemaType.TypeString },
    },
    videoRoomName: {
      type: schemaType.TypeString,
    },
    chatChannelName: { type: schemaType.TypeString },
    quoteAmount: { type: schemaType.TypeNumber },
    createdAt: {
      type: schemaType.TypeDate,
      default: Date.now,
    },
  },

  { timestamps: true }
);

export default userBookServSchema;
