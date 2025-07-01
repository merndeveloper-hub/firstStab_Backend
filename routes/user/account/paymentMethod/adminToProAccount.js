import Joi from "joi";
import getAccessToken from "./accessToken.js";
import axios from "axios";

const schema = Joi.object({
  amount: Joi.number().required(),
  userId: Joi.string(),
  proServiceId: Joi.string(),
  professsionalId: Joi.string(),
  bookServiceId: Joi.string(),
  userAccpetBookingId: Joi.string(),
  paymentMethod: Joi.string(),
  sender: Joi.string(),
  reciever: Joi.string(),
  type: Joi.string(),
  receiverEmail: Joi.string(),
});

const sendPayout = async (req, res) => {
  try {
    await schema.validateAsync(req.body);
    const {
      amount,
      userId,
      proServiceId,
      professsionalId,
      bookServiceId,
      userAccpetBookingId,
      paymentMethod,
      sender,
      reciever,
      type,
      receiverEmail,
    } = req.body;
    const getToken = await getAccessToken();
    console.log(getToken, "getToken-------");

    if (!getToken || getToken.length == 0) {
      return res
        .status(400)
        .json({ status: 400, message: "Paypal Authorization Failed!" });
    }
    //const accessToken = await getAccessToken();
    const BASE_URL = process.env.PAYPAL_API_DEVELOPMENT_URL; // Use live URL in production
    console.log(BASE_URL, "1");

    const response = await axios.post(
      `${BASE_URL}/v1/payments/payouts`,
      {
        sender_batch_header: {
          sender_batch_id: `batch-${Date.now()}`,
          email_subject: "You have a payout!",
          email_message:
            "You have received a payout! Thanks for using our service!",
        },
        items: [
          {
            recipient_type: "EMAIL",
            amount: {
              value: amount,
              currency: "USD",
            },
            receiver: receiverEmail,
            note: "Thank you for your service!",
            sender_item_id: `item-${Date.now()}`,
          },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${getToken}`,
          "Content-Type": "application/json",
        },
      }
    );
    console.log(response.data, "data-------------");

    // const payoutStatusResponse = await axios.get(
    //   `https://api.sandbox.paypal.com/v1/payments/payouts/${response.data.batch_header.payout_batch_id}`,
    //   {
    //     headers: {
    //       Authorization: `Bearer ${getToken}`,
    //       "Content-Type": "application/json",
    //     },
    //   }
    // );
    // console.log("Payout Status Details:", payoutStatusResponse.data);

    return res.status(200).json({ status: 200, message: response.data });
  } catch (error) {
    console.log(
      "Error Response:",
      error.response ? error.response.data : error.message
    );

    return res.status(400).json({ status: 400, message: error.message });
  }
};

export default sendPayout;

// var fetch = require("node-fetch");

// fetch("https://api-m.sandbox.paypal.com/v1/payments/payouts", {
//   method: "POST",
//   headers: {
//     "Content-Type": "application/json",
//     Authorization:
//       "Bearer A101.OLQiCyqOpVwigKQQDu3CYlamZ1KTKQmhrbAZK85RIy4IiWh9d_up_lTadp_lfXdV.P3gvkY3PO28akjKYaDorm12QdfK",
//   },
//   body: JSON.stringify({
//     sender_batch_header: {
//       sender_batch_id: "Payouts_2018_100007",
//       email_subject: "You have a payout!",
//       email_message:
//         "You have received a payout! Thanks for using our service!",
//     },
//     items: [
//       {
//         recipient_type: "EMAIL",
//         amount: { value: "9.87", currency: "USD" },
//         note: "Thanks for your patronage!",
//         sender_item_id: "201403140001",
//         receiver: "receiver@example.com",
//         alternate_notification_method: {
//           phone: { country_code: "91", national_number: "9999988888" },
//         },
//         notification_language: "fr-FR",
//       },
//       // {
//       //   recipient_type: "PHONE",
//       //   amount: { value: "112.34", currency: "USD" },
//       //   note: "Thanks for your support!",
//       //   sender_item_id: "201403140002",
//       //   receiver: "91-734-234-1234",
//       // },
//       // {
//       //   recipient_type: "PAYPAL_ID",
//       //   amount: { value: "5.32", currency: "USD" },
//       //   note: "Thanks for your patronage!",
//       //   sender_item_id: "201403140003",
//       //   receiver: "G83JXTJ5EHCQ2",
//       //   purpose: "GOODS",
//       // },
//     ],
//   }),
// });
