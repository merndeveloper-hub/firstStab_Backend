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
    inPersonOTP: {
      type: schemaType.TypeString,
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
    FinishedDate: { type: schemaType.TypeString, default: null },
    CancelDate: { type: schemaType.TypeString, default: null },
    CancelTime: { type: schemaType.TypeString, default: null },
    CancelCharges: { type: schemaType.TypeNumber, default: 0.0 },
    CancelSlot: { type: schemaType.TypeNumber, default: 0 },

    ExtendedTime: { type: schemaType.TypeString, default: null },
    ExtensionCharges: { type: schemaType.TypeNumber, default: 0.0 },

    requestId: {
      type: schemaType.TypeString,
      deafult: 0,
      //  required: true,
    },
    amountReturn: {
      type: schemaType.TypeString,
    },
    quoteAmount: { type: schemaType.TypeNumber },
    //   paypal_fee: { type: schemaType.TypeNumber },
    platformFees: {
      type: schemaType.TypeNumber,
    },
    paypalFixedFee: {
      type: schemaType.TypeNumber,
    },
    paypalFeePercentage: {
      type: schemaType.TypeNumber,
    },
    service_fee: { type: schemaType.TypeNumber },
    tax_fee: { type: schemaType.TypeNumber },
    total_amount: { type: schemaType.TypeNumber },
    total_amount_cus_pay: { type: schemaType.TypeNumber },
    total_amount_cus_pay_with_charges: { type: schemaType.TypeNumber },
    quoteInfo: { type: schemaType.TypeString, maxlength: 2000 },
    quoteDetail: { type: schemaType.TypeString }, // Text in MongoDB is stored as a long string

    quoteCreatedDateTime: { type: schemaType.TypeString },
  refundReason: { type: schemaType.TypeString },
    cancelledReason: {
      type: schemaType.TypeString,
      default: "",
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
        "Provider No Show", // Pro meeting mein nahi aaya
        "Provider Delayed", // Pro late ho gaya
        "Provider Cancelled", // Pro ne khud cancel kiya
        "Provider Double Booked", // Pro ne ek hi waqt pe multiple bookings le li

        // User side specific
        "User No Show", // User meeting mein nahi aaya
        "User Cancelled", // User ne khud cancel kiya
        "User Did Not Respond", // User ne timely response nahi diya

        // Platform / Technical
        "Technical Issues", // App/connection/technical problem
        "Payment Issues", // Payment fail ya refund related
        "Verification Issues", // Background check / KYC failure
        "Policy Violation", // Rules breach hone ki wajah se cancel

        // Generic
        "Others",
      ],
    },
// ✅ Timezone fields
  timezone: {
    type: schemaType.TypeString,
    //required: true,
    default: "UTC",
    description: "User's timezone when booking was created"
  },
    reasonDescription: {
      type: schemaType.TypeString,
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
    orderRescheduleReason: {
      type: schemaType.TypeString,
      default: "NA",
    },
    orderRescheduleNumber: {
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
      default: "NA",
    },

    orderRescheduleEndTime: {
      type: schemaType.TypeString,
      default: "",
    },

    orderExtendEndTime: {
      type: schemaType.TypeString,
      default: "NA",
    },

    orderRescheduleRequest: {
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
        "Confirmed",
        "Unavailable",
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
    ProfessionalPayableAmount: { type: schemaType.TypeNumber },
    userPayableAmount: { type: schemaType.TypeNumber },
    CancellationChargesApplyTo: {
      type: schemaType.TypeString,
      // enum: ["pro", "user"],
    },
    RefundableAmount: { type: schemaType.TypeNumber, default: 0.0 },
    amountToReturn: { type: schemaType.TypeString },
    priceToReturn: { type: schemaType.TypeNumber },
    complexity_tier: {
      type: schemaType.TypeString,
      enum: ["moderate", "complex", "simple"],
      // required: true,
    },
    price_model: {
      type: schemaType.TypeString,
      enum: ["fixed", "range", "quote_only"],
      // required: true,
    },
    fixed_price: { type: schemaType.TypeString },
    min_price: { type: schemaType.TypeString },
    max_price: { type: schemaType.TypeString },

    range_price: { type: schemaType.TypeString },
    review: { type: schemaType.TypeString },
    reviewCount: { type: schemaType.TypeNumber },
    paymentMethod: { type: schemaType.TypeString },
    userPayToAdmin: { type: schemaType.TypeString, default: "Pending" },
    adminPayToPro: { type: schemaType.TypeString },
    userToAdminPaypalCharges: {
      gross_amount: { type: schemaType.TypeString },
      paypal_fee: { type: schemaType.TypeString },
      net_amount: { type: schemaType.TypeString },
    },
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

// ProfessionalPayableAmount: { type: schemaType.TypeNumber, required: true },
// CancellationChargesApplyTo: { type: schemaType.TypeString, default: null },
// RefundableAmount: { type: schemaType.TypeNumber, default: 0.00 },
