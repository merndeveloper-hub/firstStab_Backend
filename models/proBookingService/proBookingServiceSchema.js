import mongoose from "mongoose";
import schemaType from "../../types/index.js";

const proBookingServiceSchema = new mongoose.Schema(
  {
    media: {
      type: schemaType.TypeArray,
    },
      serviceImage: {
          type: schemaType.TypeArray,
        },
        inPersonOTP:{
          type: schemaType.TypeString
        },
    userId: {
      type: schemaType.ObjectID,
      ref: "user",
      // required: true,
    },
     addressId: {
          type: schemaType.ObjectID,
          ref: "address",
        },
    professsionalId: {
      type: schemaType.ObjectID,
      ref: "user",
    },
    proServiceId: {
      type: schemaType.ObjectID,
      ref: "proCategory",
    },
    bookServiceId: {
      type: schemaType.ObjectID,
      ref: "userBookServ",
    },
    categoryId: {
      type: schemaType.ObjectID,
      ref: "category",
    },
    subCategoryId: {
      type: schemaType.ObjectID,
      ref: "subCategory",
    },
    addInstruction: { type: schemaType.TypeString, default: "" },

    StartedTime: { type: schemaType.TypeString, default: null },
    FinishedTime: { type: schemaType.TypeString, default: null },
    CancelDateTime: { type: schemaType.TypeString, default: null },
    CancelCharges: { type: schemaType.TypeNumber, default: 0.0 },
    CancelSlot: { type: schemaType.TypeNumber, default: 0 },
    ExtendedTime: { type: schemaType.TypeString, default: null },
    ExtensionCharges: { type: schemaType.TypeNumber, default: 0.0 },

    requestId: {
      type: schemaType.TypeString,
      deafult: 0,
      //  required: true,
    },
    quoteAmount: { type: schemaType.TypeNumber },
    paypal_fee: { type: schemaType.TypeNumber },
    service_fee: { type: schemaType.TypeNumber },
    tax_fee: { type: schemaType.TypeNumber },
    total_amount: { type: schemaType.TypeNumber },
    total_amount_cus_pay: { type: schemaType.TypeNumber },
    quoteInfo: { type: schemaType.TypeString, maxlength: 2000 },
    quoteDetail: { type: schemaType.TypeString }, // Text in MongoDB is stored as a long string

    quoteCreatedDateTime: { type: schemaType.TypeString },

    cancelledReason: {
      type: schemaType.TypeString,
      default: "",
    },
    serviceType: {
      type: schemaType.TypeString,
      enum: ["isChat", "isVirtual", "isRemote", "isInPerson"],
      //required: true,
    },
    serviceName: {
      type: schemaType.TypeString,

      // required: true,
    },
    typeOfWork: {
      type: schemaType.TypeString,

      //  required: true,
    },
    problemDescription: {
      type: schemaType.TypeString,

      // required: true,
    },
    quotesReceived: {
      type: schemaType.TypeNumber,
      default: 0,
    },
    orderStartDate: { type: schemaType.TypeString },
    orderStartTime: { type: schemaType.TypeString },
    orderEndDate: { type: schemaType.TypeString },
    orderEndTime: { type: schemaType.TypeString },
    serviceAssign: {
      type: schemaType.TypeString,
      enum: ["Professional", "Random"],
      default: "Random",
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
    orderRescheduleEndDate: {
      type: schemaType.TypeString,
      default: "",
    },
    orderExtendStatus: {
      type: schemaType.TypeString,
      default: "",
    },
    orderRescheduleEndTime: {
      type: schemaType.TypeString,
      default: "",
    },
    orderExtendEndTime: {
      type: schemaType.TypeString,
      default: "",
    }, orderRescheduleRequest: {
          type: schemaType.TypeString,
          default: "NA",
        },
    status: {
      type: schemaType.TypeString,
      enum: [
        "Cancelled",
        "Accepted",
        "Completed",
        "OnGoing",
        "Pending",
        "Rejected",
        "Delivered",
      ],
      default: "OnGoing",
    },
    videoRoomName: {
      type: schemaType.TypeString,
    },
     orderRatingPending: {
               type: schemaType.TypeString,
                    default: "Yes",
            },
    chatChannelName: { type: schemaType.TypeString },
  },
  { timestamps: true }
);

export default proBookingServiceSchema;

// const bookingDetailsSchema = new mongoose.Schema({
//     ID: { type: schemaType.TypeNumber, required: true, unique: true },
//     OrderType: { type: schemaType.TypeString, required: true },
//     BookingDate: { type: schemaType.TypeString, required: true },
//     StartTime: { type: schemaType.TypeString, required: true },
//     EndTime: { type: schemaType.TypeString, required: true },
//     Total: { type: schemaType.TypeNumber, required: true },
//     OurCharges: { type: schemaType.TypeNumber, required: true },
//     ProfessionalPayableAmount: { type: schemaType.TypeNumber, required: true },
//     Status: { type: schemaType.TypeString, required: true },
//     PaymentStatus: { type: schemaType.TypeString, required: true },
//     ConfirmedDateTime: { type: schemaType.TypeDate, required: true },
//     PaymentDateTime: { type: schemaType.TypeDate, required: true },
//     CancelReason: { type: schemaType.TypeString, default: null },
//     CancellationChargesApplyTo: { type: schemaType.TypeString, default: null },
//     RefundableAmount: { type: schemaType.TypeNumber, default: 0.00 },
//     userBookServiceId: { type: schemaType.TypeObjectId, ref: 'userBookServ' }
// },{ timestamps: true });

//export default bookingDetailsSchema;

// booking
// bookingRatings
// bookingQuotes
// bookingPayment
// bookingStatus
// bookingTimeline
