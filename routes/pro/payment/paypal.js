import axios from "axios";
import getAccessToken from "./accessToken.js";
import Joi from "joi";
import { insertNewDocument } from "../../../helpers/index.js";
import Stripe from "stripe";

let stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const schema = Joi.object({
  amount: Joi.number().required(),
  professionalId: Joi.string().required(),
  paymentMethod: Joi.string(),
  sender: Joi.string(),
  reciever: Joi.string(),
  currency:Joi.string(),
  type: Joi.string(),
});

const createPaypalOrder = async (req, res) => {
  try {
    await schema.validateAsync(req.body);
    const {
      amount,

      professionalId,
      currency,
      paymentMethod,
      sender,
      reciever,
      type,
    } = req.body;

    if (paymentMethod == "paypal") {
      const getToken = await getAccessToken();
      console.log(getToken, "getToken---------");

      if (!getToken || getToken.length == 0) {
        return res
          .status(400)
          .json({ status: 400, message: "Paypal Authorization Failed!" });
      }
      const BASE_URL = process.env.PAYPAL_API_DEVELOPMENT_URL; // Use live URL in production

      const orderData = {
        intent: "CAPTURE", // Use "CAPTURE" instead of "sale"
        //intent: "AUTHORIZE", // This will authorize the amount but not transfer it yet.
        purchase_units: [
          // {
          //   amount: {
          //     currency_code: "USD",
          //     value: amount,
          //   },
          //   description: "Payment for service",
          // },
          {
            amount: {
              currency_code: "USD",
              value: amount,
              breakdown: {
                item_total: { currency_code: "USD", value: amount },
              },
            },
            items: [
              {
                name: "Website service",
                description: "crate a website wiht fully functional",
                unit_amount: { currency_code: "USD", value: amount },
                quantity: "1",
              },
            ],
          },
        ],
        application_context: {
          return_url:
            //   "http://3.110.42.187:5000/api/v1/user/account/payment/paypalsuccess",
            "http://3.110.42.187:5000/api/v1/pro/payment/paypalsuccess",

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

      if (!response || response.length == 0) {
        return res.status(400).json({ status: 400, message: "Try Again!" });
      }

      const data = {
        id: response.data.id,
        status: "CREATED",
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
        reciever: "Admin",
        type: "Pro_Register_Service",
        paypalOrderId: response.data.id,
        status: "Success",
      });

      return res.status(201).json({ status: 201, data: data });
    } 
    else if (paymentMethod == "stripe") {
      const { professionalId, amount } = req.body;

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [{
      price_data: {
        currency: 'usd',
        product_data: {
          name: 'My App Payment',
        },
        unit_amount: amount  
      },
      quantity: 1,
    }],
    mode: 'payment',
    success_url: `http://3.110.42.187:5000/api/v1/pro/payment/stripesuccess?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: "http://3.110.42.187:5000/api/v1/pro/payment/stripecancel?session_id={CHECKOUT_SESSION_ID}",
    metadata: { professionalId },
  });

  console.log(session,"session------");
  
const data = {
     id: session.id,
     status: "CREATED",
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

