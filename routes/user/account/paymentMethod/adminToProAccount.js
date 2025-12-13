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


    if (!getToken || getToken.length == 0) {
      return res
        .status(400)
        .json({ status: 400, message: "Paypal Authorization Failed!" });
    }

    const BASE_URL = process.env.PAYPAL_API_DEVELOPMENT_URL; // Use live URL in production


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


