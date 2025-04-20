import axios from "axios";
import getAccessToken from "./accessToken.js";
import Joi from "joi";
import { insertNewDocument } from "../../../../helpers/index.js";

const schema = Joi.object({
  amount: Joi.number().required(),
  userId: Joi.string(),
  proServiceId: Joi.string(),
  professsionalId: Joi.string(),
  bookServiceId: Joi.string(),
  userAccpetBookingId: Joi.string(),
});

const createPaypalOrder = async (req, res) => {
  try {
    await schema.validateAsync(req.body);
    const {
      amount,
      userId,
      proServiceId,
      professsionalId,
      bookServiceId,
      userAccpetBookingId,
    } = req.body;
    const getToken = await getAccessToken();
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
        {
          amount: {
            currency_code: "USD",
            value: amount,
          },
          description: "Payment for service",
        },
      ],
      application_context: {
        return_url:
          "http://3.110.42.187:5000/api/v1/user/account/payment/paypalsuccess",
        cancel_url:
          "http://3.110.42.187:5000/api/v1/user/account/payment/paypalcancel",
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
          href: response.data.links.find((link) => link.rel === "approve").href,
          rel: "approve",
          method: "GET",
        },
      ],
    };

    const userPayment = await insertNewDocument("userPayment", {
      ...req.body,
      paypalOrderId: response.data.id,
      status: "Success",
    });

    return res.status(201).json({ status: 201, data: data });
  } catch (error) {
    return res.status(400).json({ status: 400, message: error.message });
  }
};

export default createPaypalOrder;
