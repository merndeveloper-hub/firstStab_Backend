import mongoose from "mongoose";
import SchemaType from "../../types/index.js";

const PaymentSchema = new mongoose.Schema(
  {
    professionalId: { type: SchemaType.ObjectID, ref: "User" },
    amount: {
      type: SchemaType.TypeNumber,
     
    },

    paymentIntentId: { type: SchemaType.TypeString },

    transactionId: { type: SchemaType.TypeString },
    // status: { type: SchemaType.TypeString, enum: [ "Success", "Failed","Pending", "Released", "Refunded"], default: "Pending" },

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
     netAmount: { type: SchemaType.TypeNumber },
          stripeFee: { type: SchemaType.TypeNumber },
          totalAmount: { type: SchemaType.TypeNumber },
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

    paymentSource: {
      paypalAccountId: { type: SchemaType.TypeString },
      paypalEmail: { type: SchemaType.TypeString },
      paypalAccountStatus: { type: SchemaType.TypeString },
    },
baseAmount: { type: SchemaType.TypeNumber },
    paypalFee: { type: SchemaType.TypeNumber },
    finalAmount: { type: SchemaType.TypeNumber },
    purchaseUnitReference: { type: SchemaType.TypeString }, // purchase_units[0].reference_id

    paypalLink: { type: SchemaType.TypeString }, // links[0].href
  },
  { timestamps: true }
);

export default PaymentSchema;
