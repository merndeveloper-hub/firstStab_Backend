import Joi from "joi";
import { findOne, updateDocument } from "../../../helpers/index.js";

import getAccessToken from "../account/paymentMethod/accessToken.js";
import axios from "axios";

const schema = Joi.object().keys({
  id: Joi.string().required(),
});

const schemaBody = Joi.object({
  isVirtual: Joi.string(),
  FinishedTime: Joi.string().required(),
  FinishedDate: Joi.string().required(),
  //   userId: Joi.string(),
  //   proServiceId: Joi.string(),
  //   professsionalId: Joi.string(),
  //   bookServiceId: Joi.string(),
  //   userAccpetBookingId: Joi.string(),
  //   paymentMethod: Joi.string(),
  //   sender: Joi.string(),
  //   reciever: Joi.string(),
  //   type: Joi.string(),
  //   receiverEmail: Joi.string(),
});

//serviceImage
const completedBooking = async (req, res) => {
  try {
    await schemaBody.validateAsync(req.body);
    const {
      isVirtual,
      FinishedTime, FinishedDate
      //   userId,
      //   proServiceId,
      //   professsionalId,
      //   bookServiceId,
      //   userAccpetBookingId,
      //   paymentMethod,
      //   sender,
      //   reciever,
      //   type,
      //   receiverEmail,
    } = req.body;
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
        { status: "Completed",FinishedTime, FinishedDate }
      );

      if (!deliveredBooking || deliveredBooking.length == 0) {
        return res
          .status(400)
          .json({ status: 400, message: "No Booking Found!" });
      }

      const deliveredRandomProBooking = await updateDocument(
        "proBookingService",
        { bookServiceId: id },
        { status: "Completed",FinishedTime, FinishedDate }
      );
    } else {
      const deliveredBooking = await updateDocument(
        "userBookServ",
        { _id: id, status: "Delivered" },
        { status: "Completed",FinishedTime, FinishedDate }
      );

      if (!deliveredBooking || deliveredBooking.length == 0) {
        return res
          .status(400)
          .json({ status: 400, message: "No Booking Found!" });
      }

      const deliveredRandomProBooking = await updateDocument(
        "proBookingService",
        { bookServiceId: id, status: "Delivered" },
        { status: "Completed,",FinishedTime, FinishedDate }
      );
    }
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
              value: "1",
              currency: "USD",
            },
            receiver: "sb-koped40938811@personal.example.com",
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

    return res.status(200).json({
      status: 200,
      message: "Delivered Service By Professional",
     // deliveredBooking,
    });
  } catch (e) {
    console.log(e);
    return res.status(400).json({ status: 400, message: e.message });
  }
};

export default completedBooking;

// import Joi from "joi";
// import getAccessToken from "./accessToken.js";
// import axios from "axios";

// const schema = Joi.object({
//   amount: Joi.number().required(),
//   userId: Joi.string(),
//   proServiceId: Joi.string(),
//   professsionalId: Joi.string(),
//   bookServiceId: Joi.string(),
//   userAccpetBookingId: Joi.string(),
//   paymentMethod: Joi.string(),
//   sender: Joi.string(),
//   reciever: Joi.string(),
//   type: Joi.string(),
//   receiverEmail: Joi.string(),
// });

// const sendPayout = async (req, res) => {
//   try {
//     await schema.validateAsync(req.body);
//     const {
//       amount,
//       userId,
//       proServiceId,
//       professsionalId,
//       bookServiceId,
//       userAccpetBookingId,
//       paymentMethod,
//       sender,
//       reciever,
//       type,
//       receiverEmail,
//     } = req.body;
//     const getToken = await getAccessToken();
//     console.log(getToken, "getToken-------");

//     if (!getToken || getToken.length == 0) {
//       return res
//         .status(400)
//         .json({ status: 400, message: "Paypal Authorization Failed!" });
//     }
//     //const accessToken = await getAccessToken();
//     const BASE_URL = process.env.PAYPAL_API_DEVELOPMENT_URL; // Use live URL in production
//     console.log(BASE_URL, "1");

//     const response = await axios.post(
//       `${BASE_URL}/v1/payments/payouts`,
//       {
//         sender_batch_header: {
//           sender_batch_id: `batch-${Date.now()}`,
//           email_subject: "You have a payout!",
//           email_message:
//             "You have received a payout! Thanks for using our service!",
//         },
//         items: [
//           {
//             recipient_type: "EMAIL",
//             amount: {
//               value: amount,
//               currency: "USD",
//             },
//             receiver: receiverEmail,
//             note: "Thank you for your service!",
//             sender_item_id: `item-${Date.now()}`,
//           },
//         ],
//       },
//       {
//         headers: {
//           Authorization: `Bearer ${getToken}`,
//           "Content-Type": "application/json",
//         },
//       }
//     );
//     console.log(response.data, "data-------------");

//     // const payoutStatusResponse = await axios.get(
//     //   `https://api.sandbox.paypal.com/v1/payments/payouts/${response.data.batch_header.payout_batch_id}`,
//     //   {
//     //     headers: {
//     //       Authorization: `Bearer ${getToken}`,
//     //       "Content-Type": "application/json",
//     //     },
//     //   }
//     // );
//     // console.log("Payout Status Details:", payoutStatusResponse.data);

//     return res.status(200).json({ status: 200, message: response.data });
//   } catch (error) {
//     console.log(
//       "Error Response:",
//       error.response ? error.response.data : error.message
//     );

//     return res.status(400).json({ status: 400, message: error.message });
//   }
// };

// export default sendPayout;
