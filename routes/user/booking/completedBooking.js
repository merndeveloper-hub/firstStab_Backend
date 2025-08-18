import Joi from "joi";
import {
  findOne,
  updateDocument,
  insertNewDocument,
} from "../../../helpers/index.js";

import getAccessToken from "../account/paymentMethod/accessToken.js";
import axios from "axios";
import pollPayout from "../../../utils/cron/index.js";

const schema = Joi.object().keys({
  id: Joi.string().required(),
});

const schemaBody = Joi.object({
  isVirtual: Joi.string(),
  FinishedTime: Joi.string().required(),
  FinishedDate: Joi.string().required(),
});

//serviceImage
const completedBooking = async (req, res) => {
  try {
    await schemaBody.validateAsync(req.body);
    const { isVirtual, FinishedTime, FinishedDate } = req.body;

    const getToken = await getAccessToken();
    console.log(getToken, "getToken-------");

    if (!getToken || getToken.length == 0) {
      return res
        .status(400)
        .json({ status: 400, message: "Paypal Authorization Failed!" });
    }

    await schema.validateAsync(req.params);
    const { id } = req.params;

    const deliveredUserBooking = await findOne("userBookServ", { _id: id });
    if (!deliveredUserBooking || deliveredUserBooking.length == 0) {
      return res
        .status(400)
        .json({ status: 400, message: "No Booking Found!" });
    }

    if (isVirtual == "virtual") {
      const deliveredBooking = await updateDocument(
        "userBookServ",
        { _id: id },
        { status: "Completed", FinishedTime, FinishedDate }
      );

      if (!deliveredBooking || deliveredBooking.length == 0) {
        return res
          .status(400)
          .json({ status: 400, message: "No Booking Found!" });
      }

      await updateDocument(
        "proBookingService",
        { bookServiceId: id },
        { status: "Completed", FinishedTime, FinishedDate }
      );
    } else {
      const deliveredBooking = await updateDocument(
        "userBookServ",
        { _id: id, status: "Delivered" },
        { status: "Completed", FinishedTime, FinishedDate }
      );

      if (!deliveredBooking || deliveredBooking.length == 0) {
        return res
          .status(400)
          .json({ status: 400, message: "No Booking Found!" });
      }

      const deliveredRandomProBooking = await updateDocument(
        "proBookingService",
        { bookServiceId: id, status: "Delivered" },
        { status: "Completed", FinishedTime, FinishedDate }
      );
    }

    let getPayment = await findOne("userPayment", { bookServiceId: id });
    console.log(getPayment, "getPayment");
    let findPro = await findOne("user", { _id: getPayment?.professsionalId });
    if (!getPayment || getPayment.length == 0) {
      return res
        .status(400)
        .json({ status: 400, message: "User Payment Not Found!" });
    }

    // ✅ paypalOrderId direct object se lo
    if (
      getPayment?.reciever == "Admin" &&
      getPayment?.status == "COMPLETED" &&
      getPayment?.paypalOrderId
    ) {
      console.log("1");

      const BASE_URL = process.env.PAYPAL_API_DEVELOPMENT_URL;
      console.log(BASE_URL, "1");

      try {
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
                  value: String(getPayment?.amount), // ✅ string hona chahiye
                  currency: "USD",
                },
                receiver: findPro?.email, // Pro ka email
                note: "Thank you for your service!",
                sender_item_id: getPayment?.paypalOrderId,
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

        // ✅ insert payout in DB
        const payoutDoc = {
          ...getPayment,
          userId: getPayment?.userId,
          professsionalId: getPayment?.professsionalId,
          bookServiceId: getPayment?.bookServiceId,
          requestId: getPayment?.requestId,
          amount: getPayment?.amount,
          currency: "USD",
          sender: "Admin",
          reciever: "Pro",
          type: "ProPayout",
          paymentMethod: "Paypal",
          status: "PROCESSING", // ✅ abhi processing rakho
          retryCount: 0, // ✅ naye field

          payout_batch_id: response.data?.batch_header?.payout_batch_id,
          batch_status: response.data?.batch_header?.batch_status,
          paypalLink: response.data?.links?.[0]?.href || null,

          status: "Initiated",
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        console.log(payoutDoc, "payoutDoc");

        const userPayment = await insertNewDocument("userPayment", payoutDoc); // ✅ fixed
        console.log(userPayment, "userPayment");
        console.log("✅ Payout saved:", userPayment);
        




// 🔄 Polling start
pollPayout(userPayment._id, payoutDoc.payout_batch_id);
      } catch (err) {
        console.error("❌ Payout error:", err.response?.data || err.message);
      }
    }

    return res.status(200).json({ status: 200, message: "Booking completed!" });
  } catch (err) {
    console.error("❌ Error:", err.message);
    return res.status(500).json({ status: 500, message: "Server Error!" });
  }
};

export default completedBooking;
