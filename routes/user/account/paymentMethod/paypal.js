import axios from "axios";
import getAccessToken from "./accessToken.js";
import Joi from "joi";
import {
  insertNewDocument,
  findOne,
  updateDocument,
} from "../../../../helpers/index.js";
import Stripe from "stripe";
import { calculateTotalAmount } from "../../../../utils/index.js";
let stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const schema = Joi.object({
  amount: Joi.number().required(),
  userId: Joi.string().required(),
  //  proServiceId: Joi.string(),
  professsionalId: Joi.string().required(),
  bookServiceId: Joi.string().required(),
  //  userAccpetBookingId: Joi.string(),
  paymentMethod: Joi.string().required(),
  //sender: Joi.string(),
  //  reciever: Joi.string(),
  //  type: Joi.string(),
});

const createPaypalOrder = async (req, res) => {
  try {
    await schema.validateAsync(req.body);
    const {
      amount,
      userId,
      bookServiceId, // proBookservice id
      professsionalId,
      paymentMethod,
    } = req.body;
    if (paymentMethod == "paypal") {
      const proBookService = await findOne("proBookingService", {
        _id: bookServiceId,
      });

      if (!proBookService || proBookService.length == 0) {
        return res
          .status(400)
          .json({ status: 400, message: "Does not exist booking service!" });
      }

      const platform = await findOne("adminFees");

      const paypalFeePercentage = parseFloat(platform?.paypalFeePercentage);

      const paypalFixedFee = parseFloat(platform?.paypalFixedFee);

      //Get tax from TaxJar (assumed to be a number)
      let serviceAmount = proBookService?.service_fee;
      let paltformCharges = proBookService?.platformFees;
      let getTaxVal = proBookService?.tax_fee;

      const totalAmount = calculateTotalAmount(
        serviceAmount,
        paltformCharges,
        Number(getTaxVal),
        paypalFeePercentage || 0,
        paypalFixedFee || 0
      );
      console.log("Total Amount user should pay:", totalAmount);
      //total_amount_cus_pay_with_charges
      const getToken = await getAccessToken();
      console.log(getToken, "getToken---------");

      // let getBooking = await findOne("proBookingService", { _id:bookServiceId });
      // console.log(getBooking, "getBooking");

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
              value: Number(totalAmount),
              breakdown: {
                item_total: {
                  currency_code: "USD",
                  value: Number(totalAmount),
                },
              },
            },
            items: [
              {
                name: "Website service",
                description: "crate a website wiht fully functional",
                unit_amount: {
                  currency_code: "USD",
                  value: Number(totalAmount),
                },
                quantity: "1",
              },
            ],
          },
        ],
        application_context: {
          return_url:
            "http://localhost:5000/api/v1/user/account/payment/paypalsuccess",
      //     "http://3.110.42.187:5000/api/v1/user/account/payment/paypalsuccess",

          cancel_url:
            "http://3.110.42.187:5000/api/v1/user/account/payment/paypalcancel",
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

      ////Extend Scenario------------------------------------------------

      console.log("checking");

      const userPayment = await insertNewDocument("userPayment", {
        ...req.body,
        amount: Number(totalAmount),
        requestId: proBookService?.requestId,
        platformFees: proBookService?.platformFees,
        paypalFixedFee: paypalFixedFee,
        paypalFeePercentage: paypalFeePercentage,
        service_fee: proBookService?.service_fee,
        tax_fee: proBookService?.tax_fee,
        paymentMethod: "Paypal",
        sender: "User",
        reciever: "Admin",
        type: "UserBooking",
        paypalOrderId: response.data.id,
        // status: "Success",
        status: "CREATED",
      });
      const updateProBookService = await updateDocument(
        "proBookingService",
        { _id: bookServiceId },
        {
          total_amount_cus_pay_with_charges: Number(totalAmount),
          paypalFixedFee: paypalFixedFee,
          paypalFeePercentage: paypalFeePercentage,
        }
      );
      return res.status(201).json({ status: 201, data: data });
    } else if (paymentMethod == "stripe") {
      const { userId, amount } = req.body;
      const proBookService = await findOne("proBookingService", {
        _id: bookServiceId,
      });

      if (!proBookService || proBookService.length == 0) {
        return res
          .status(400)
          .json({ status: 400, message: "Does not exist booking service!" });
      }

      const platform = await findOne("adminFees");

      const stripeFeePercentage = parseFloat(platform?.stripeFeePercentage);

      const stripeFixedFee = parseFloat(platform?.stripeFixedFee);

      //Get tax from TaxJar (assumed to be a number)
      let serviceAmount = proBookService?.service_fee;
      let paltformCharges = proBookService?.platformFees;
      let getTaxVal = proBookService?.tax_fee;

      const totalAmount = calculateTotalAmount(
        serviceAmount,
        paltformCharges,
        Number(getTaxVal),
        stripeFeePercentage || 0,
        stripeFixedFee || 0
      );
      console.log("Total Amount user should pay:", totalAmount);

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: "usd",
              product_data: {
                name: "My App Payment",
              },
              unit_amount: amount,
            },
            quantity: 1,
          },
        ],
        mode: "payment",
        success_url: `http://3.110.42.187:5000/api/v1/user/account/payment/stripesuccess?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url:
          "http://3.110.42.187:5000/api/v1/user/account/payment/stripecancel?session_id={CHECKOUT_SESSION_ID}",
        metadata: { userId },
      });

      console.log(session, "session------");

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

      const userPayment = await insertNewDocument("userPayment", {
        ...req.body,

        paymentMethod: "Stripe",
        sender: "User",
        reciever: "Admin",
        type: "UserBooking",
        stripeSessionId: session.id, // session.id
        stripeSessionUrl: session.url, // session.url
        status: "Pending", // will be 'Success' after webhook confirms
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

// var fetch = require("node-fetch");

// fetch("https://api-m.sandbox.paypal.com/v2/checkout/orders", {
//   method: "POST",
//   headers: {
//     "Content-Type": "application/json",
//     "PayPal-Request-Id": "7b92603e-77ed-4896-8e78-5dea2050476a",
//     Authorization:
//       "Bearer 6V7rbVwmlM1gFZKW_8QtzWXqpcwQ6T5vhEGYNJDAAdn3paCgRpdeMdVYmWzgbKSsECednupJ3Zx5Xd-g",
//   },
//   body: JSON.stringify({
//     intent: "CAPTURE",
//     payment_source: {
//       paypal: {
//         experience_context: {
//           payment_method_preference: "IMMEDIATE_PAYMENT_REQUIRED",
//           landing_page: "LOGIN",
//           shipping_preference: "GET_FROM_FILE",
//           user_action: "PAY_NOW",
//           return_url: "https://example.com/returnUrl",
//           cancel_url: "https://example.com/cancelUrl",
//         },
//       },
//     },
//     purchase_units: [
//       {
//         invoice_id: "90210",
//         amount: {
//           currency_code: "USD",
//           value: "230.00",
//           breakdown: {
//             item_total: { currency_code: "USD", value: "220.00" },
//             shipping: { currency_code: "USD", value: "10.00" },
//           },
//         },
//         items: [
//           {
//             name: "T-Shirt",
//             description: "Super Fresh Shirt",
//             unit_amount: { currency_code: "USD", value: "20.00" },
//             quantity: "1",
//             category: "PHYSICAL_GOODS",
//             sku: "sku01",
//             image_url:
//               "https://example.com/static/images/items/1/tshirt_green.jpg",
//             url: "https://example.com/url-to-the-item-being-purchased-1",
//             upc: { type: "UPC-A", code: "123456789012" },
//           },
//           {
//             name: "Shoes",
//             description: "Running, Size 10.5",
//             sku: "sku02",
//             unit_amount: { currency_code: "USD", value: "100.00" },
//             quantity: "2",
//             category: "PHYSICAL_GOODS",
//             image_url:
//               "https://example.com/static/images/items/1/shoes_running.jpg",
//             url: "https://example.com/url-to-the-item-being-purchased-2",
//             upc: { type: "UPC-A", code: "987654321012" },
//           },
//         ],
//       },
//     ],
//   }),
// });
