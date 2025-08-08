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
    bookServiceId: { type: SchemaType.ObjectID, ref: "userBookServ" },
    proServiceId: { type: SchemaType.ObjectID, ref: "proCategory" },
    categoryId: { type: SchemaType.ObjectID, ref: "category" },
    userAccpetBookingId: {
      type: SchemaType.ObjectID,
      ref: "proBookingService",
    },

    amount: {
      type: SchemaType.TypeNumber,
      //  required: true
    },
  totalAmount: {
      type: SchemaType.TypeNumber,
      //  required: true
    },
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
    presentmentAmount: { type:  SchemaType.TypeNumber }, // e.g., 29336
    presentmentCurrency: { type:  SchemaType.TypeString }, // e.g., PKR
        stripeSessionUrl: { type: SchemaType.TypeString },
        paymentIntentId: { type: SchemaType.TypeString },
        transactionId: { type: SchemaType.TypeString }, // can be same as paymentIntentId
        
        customerEmail: { type: SchemaType.TypeString },
        paypalOrderId: { type: SchemaType.TypeString },
        authorizationId: { type: SchemaType.TypeString },
        payerId: { type: SchemaType.TypeString },
        payerEmail: { type: SchemaType.TypeString },
        cardDetails : {
          cardBrand:{ type: SchemaType.TypeString },
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
      payerId: { type: String }, // payer_id
      payerEmail: { type: String },
      payerFirstName: { type: String },
      payerLastName: { type: String },
      payerCountryCode: { type: String },
    },

    paymentSource: {
      paypalAccountId: { type: String },
      paypalEmail: { type: String },
      paypalAccountStatus: { type: String },
    },

    purchaseUnitReference: { type: String }, // purchase_units[0].reference_id

    paypalLink: { type: String }, // links[0].href

    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

//authorizationId
export default userPaymentSchema;
