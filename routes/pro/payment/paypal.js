import axios from "axios";
import getAccessToken from "./accessToken.js";
import Joi from "joi";
import { findOne, insertNewDocument, updateDocument } from "../../../helpers/index.js";
import Stripe from "stripe";
import taxJarCal from "../../../lib/taxCollector/index.js";

let stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const schema = Joi.object({
  //amount: Joi.number().required(),
  professionalId: Joi.string().required(),
 // subCategorieId: Joi.string().required(),
  paymentMethod: Joi.string(),
  //sender: Joi.string(),
 // reciever: Joi.string(),
//  currency:Joi.string(),
 // type: Joi.string(),
});

const createPaypalOrder = async (req, res) => {
  try {
    await schema.validateAsync(req.body);
    const {
    //  amount,
subCategorieId,
      professionalId,
    //  currency,
      paymentMethod,
      sender,
      reciever,
      type,
    } = req.body;

const findProCategory = await findOne("proCategory",{proId:professionalId})



const registerationFees = await findOne("adminFees")

    if (paymentMethod == "paypal") {
      const baseAmount = parseFloat(registerationFees?.registerationFees); // from frontend or DB
  
  if (isNaN(baseAmount)) {
  throw new Error("Invalid base amount");
}

// PayPal fee calculation
const feePercentage = 3.49 / 100;
const fixedFee = 0.49;

// Get tax from TaxJar (assumed to be a number)
const getTaxVal = await taxJarCal();
// if (typeof getTaxVal !== 'number') {
//   throw new Error("Invalid tax value from TaxJar");
// }
console.log(getTaxVal, "getTaxVal---");

// Calculate PayPal fee and total charge
const paypalFee = parseFloat((baseAmount * feePercentage + fixedFee + Number(getTaxVal)).toFixed(2));
const finalAmount = parseFloat((baseAmount + paypalFee).toFixed(2)); // This is what user pays


  const getToken = await getAccessToken();
  console.log(getToken, "getToken---------");

  if (!getToken || getToken.length == 0) {
    return res.status(400).json({ status: 400, message: "Paypal Authorization Failed!" });
  }

  const BASE_URL = process.env.PAYPAL_API_DEVELOPMENT_URL;

  const orderData = {
    intent: "CAPTURE",
    purchase_units: [
      {
        amount: {
          currency_code: "USD",
          value: finalAmount.toFixed(2),
          breakdown: {
            item_total: { currency_code: "USD", value: finalAmount.toFixed(2) },
          },
        },
        items: [
          {
            name: "Website service",
            description: "Create a website with full functionality",
            unit_amount: { currency_code: "USD", value: finalAmount.toFixed(2) },
            quantity: "1",
          },
        ],
      },
    ],
    application_context: {
       return_url: `http://3.110.42.187:5000/api/v1/pro/payment/paypalsuccess?professionalId=${professionalId}&subCategorieId=${findProCategory?.subCategories[0]?.id}&proCategory=${findProCategory?._id}`,
      cancel_url: "http://3.110.42.187:5000/api/v1/pro/payment/paypalcancel",
      shipping_preference: "NO_SHIPPING",
      user_action: "PAY_NOW",
      brand_name: "firststab",
    },
  };
      const response = await axios.post(
        `${BASE_URL}/v2/checkout/orders`,
        orderData,
        {
          headers: {
            Authorization: `Bearer ${getToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log(response,"response...")

      if (!response || response.length == 0) {
        return res.status(400).json({ status: 400, message: "Try Again!" });
      }

      const data = {
        id: response.data.id,
        status: "CREATED",
        proCategory: findProCategory?._id,
        links: [
          {
            href: response.data.links.find((link) => link.rel === "approve")
              .href,
            rel: "approve",
            method: "GET",
          },
        ],
      };

      const userPayment = await insertNewDocument("payment", {
        ...req.body,
        paymentMethod: "Paypal",
        sender: "Professional",
        baseAmount,
    paypalFee,
    finalAmount,
        reciever: "Admin",
        type: "Pro_Register_Service",
        paypalOrderId: response.data.id,
        status: "Success",
      });

      return res.status(201).json({ status: 201, data: data });
    } 
    else if (paymentMethod == "stripe") {
 const pro = await findOne("payment", { professionalId });

  if (!pro?.stripeAccountId) {
    throw new Error("Stripe onboarding incomplete. Please onboard first.");
  }

  // const account = await stripe.accounts.retrieve(pro.stripeAccountId);
  // if (!account.details_submitted || !account.charges_enabled || !account.payouts_enabled) {
  //   throw new Error("Stripe account not verified. Please complete onboarding.");
  // }

// Get tax from TaxJar (assumed to be a number)
const getTaxVal = await taxJarCal();
// if (typeof getTaxVal !== 'number') {
//   throw new Error("Invalid tax value from TaxJar");
// }
console.log(getTaxVal, "getTaxVal---");









// Example calculation - aapne jaisa fees logic diya tha
const amountInDollars = parseFloat(registerationFees?.registerationFees);
const amountInCents = Math.round(amountInDollars * 100);
const stripeFeePercent = 0.029;
const fixedFee = 30; // in cents
  let taxAmount =  Number(getTaxVal).toFixed(2)
const totalAmountInCents = Math.ceil((amountInCents + fixedFee + taxAmount) / (1 - stripeFeePercent));
const feeAmountInCents = totalAmountInCents - amountInCents;

const session = await stripe.checkout.sessions.create({
  payment_method_types: ['card'],
  line_items: [{
    price_data: {
      currency: 'usd',
      product_data: {
        name: 'My App Payment',
      },
      unit_amount: totalAmountInCents,
    },
    quantity: 1,
  }],
  mode: 'payment',
  success_url: `http://3.110.42.187:5000/api/v1/pro/payment/stripesuccess?session_id={CHECKOUT_SESSION_ID}&professionalId=${professionalId}&subCategorieId=${findProCategory?.subCategories[0]?.id}&proCategory=${findProCategory?._id}`,
  cancel_url: `http://3.110.42.187:5000/api/v1/pro/payment/stripecancel?session_id={CHECKOUT_SESSION_ID}`,
  metadata: {
    professionalId: req.body.professionalId,
    netAmount: amountInCents,           // user ka original amount (cents)
    stripeFee: feeAmountInCents,        // calculated Stripe fees (cents)
    totalAmount: totalAmountInCents     // total charge (cents)
  },
});


  console.log(session,"session------");
  
const data = {
     id: session.id,
     status: "CREATED",
       proCategory: findProCategory?._id,
     links: [
       {
         href: session.url,
         rel: "approve",
         method: "GET",
       },
     ],
   };

  const userPayment = await insertNewDocument("payment", {
    ...req.body,
    paymentMethod: "Stripe",
    sender: "Professional",
    reciever: "Admin",
    type: "Pro_Register_Service",
    stripeSessionId: session.id,                   // session.id
    stripeSessionUrl: session.url, // session.url
    status: 'Pending',                                // will be 'Success' after webhook confirms
   // paypalOrderId: response.data.id,
   // status: "Success",
  });


  return res.status(201).json({ status: 201, data: data });
 

    }
  } catch (error) {
    return res.status(400).json({ status: 400, message: error.message });
  }
};

export default createPaypalOrder;

