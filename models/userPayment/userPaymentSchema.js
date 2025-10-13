import mongoose from "mongoose";
import SchemaType from "../../types/index.js";

const userPaymentSchema = new mongoose.Schema(
  {
    userId: {
      type: SchemaType.ObjectID,
      ref: "user",
      required: true,
    },
    professsionalId: { type: SchemaType.ObjectID, ref: "user" },
    bookServiceId: { type: SchemaType.ObjectID },
    proServiceId: { type: SchemaType.ObjectID, ref: "proCategory" },
    categoryId: { type: SchemaType.ObjectID, ref: "category" },
    userAccpetBookingId: {
      type: SchemaType.ObjectID,
      ref: "proBookingService",
    },
    requestId: {
      type: SchemaType.TypeString,
      deafult: 0,
      //  required: true,
    },
    quoteAmount: { type: SchemaType.TypeNumber },
    //   paypal_fee: { type: schemaType.TypeNumber },
    platformFees: {
      type: SchemaType.TypeNumber,
    },
    paypalFixedFee: {
      type: SchemaType.TypeNumber,
    },
    paypalFeePercentage: {
      type: SchemaType.TypeNumber,
    },
    service_fee: { type: SchemaType.TypeNumber },
    tax_fee: { type: SchemaType.TypeNumber },
    // total_amount: { type: SchemaType.TypeNumber },
    //total_amount_cus_pay: { type: SchemaType.TypeNumber },
    amount: {
      type: SchemaType.TypeNumber,
      //  required: true
    },
    retryCount: {
      type: SchemaType.TypeNumber,
      //  required: true
    },
    // totalAmount: {
    //     type: SchemaType.TypeNumber,
    //     //  required: true
    //   },
    paymentMethod: { type: SchemaType.TypeString },
    sender: { type: SchemaType.TypeString },
    reciever: { type: SchemaType.TypeString },
    type: { type: SchemaType.TypeString },

    holdingName: {
      type: SchemaType.TypeString,
    },
    currency: {
      type: SchemaType.TypeString,
      default: "USD",
      //  required: true,
      // index: true
    },
    // Stripe-specific
    stripeSessionId: { type: SchemaType.TypeString },
    // New fields
    presentmentAmount: { type: SchemaType.TypeNumber }, // e.g., 29336
    presentmentCurrency: { type: SchemaType.TypeString }, // e.g., PKR
    stripeSessionUrl: { type: SchemaType.TypeString },
    paymentIntentId: { type: SchemaType.TypeString },
    transactionId: { type: SchemaType.TypeString }, // can be same as paymentIntentId

    customerEmail: { type: SchemaType.TypeString },
    paypalOrderId: { type: SchemaType.TypeString },
    authorizationId: { type: SchemaType.TypeString },
    payerId: { type: SchemaType.TypeString },
    payerEmail: { type: SchemaType.TypeString },
    cardDetails: {
      cardBrand: { type: SchemaType.TypeString },
      cardLast4: { type: SchemaType.TypeString },
      cardExpMonth: { type: SchemaType.TypeString },
      cardExpYear: { type: SchemaType.TypeString },
      cardFunding: { type: SchemaType.TypeString },
      cardCountry: { type: SchemaType.TypeString },
    },
    paypalOrderId: { type: SchemaType.TypeString },
    authorizationId: { type: SchemaType.TypeString },
    payerId: { type: SchemaType.TypeString },
    payerEmail: { type: SchemaType.TypeString },

    status: {
      type: SchemaType.TypeString,
      default: "Pending",
    },

    payer: {
      payerId: { type: SchemaType.TypeString }, // payer_id
      payerEmail: { type: SchemaType.TypeString },
      payerFirstName: { type: SchemaType.TypeString },
      payerLastName: { type: SchemaType.TypeString },
      payerCountryCode: { type: SchemaType.TypeString },
   
    },

    paypalCharges:{
       gross_amount: { type: SchemaType.TypeString},
      paypal_fee: { type: SchemaType.TypeString},
      net_amount: { type: SchemaType.TypeString },
    },
payPalRefundLinkAdminToUser:{ type: SchemaType.TypeString },
    paymentSource: {
      paypalAccountId: { type: SchemaType.TypeString },
      paypalEmail: { type: SchemaType.TypeString },
      paypalAccountStatus: { type: SchemaType.TypeString },
      captureId: { type: SchemaType.TypeString },
    },

    purchaseUnitReference: { type: SchemaType.TypeString }, // purchase_units[0].reference_id

    paypalLink: { type: SchemaType.TypeString }, // links[0].href
    payout_batch_id: { type: SchemaType.TypeString, default: "" }, // links[0].href
    batch_status: { type: SchemaType.TypeString, default: "Pending" }, // links[0].href
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

//authorizationId
export default userPaymentSchema;
