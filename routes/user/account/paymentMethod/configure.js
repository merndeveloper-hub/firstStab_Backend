import paypal from 'paypal-rest-sdk';

paypal.configure({
  "PAYPAL_CLIENT_ID":"AU-T3vm80bzgk_ygC6zvO4ECrLDxqCVsquch2-Rd_Xpakj--1C8o6pkdkBSqFxEnI9y52hGHpLJJnJ71",
"PAYPAL_CLIENT_SECRET":"EOmvmBOo_wLM_6JhuSAvCwCxaDg4ye6eR9Pt9JqyYh_lCx-zTz7X2_leuhb1w6RJuRGB2SD4TVUZUdBa",
"PAYPAL_MODE":"sandbox"

});


export default paypal


// import axios from "axios";
// import getAccessToken from "../../../../helpers/accessToken.js";
// import { createDocument } from "../../../../helpers/index.js";

// const createOrder = async (req, res) => {
//   try {
//     const { amount, currency, userId } = req.body; // frontend se

//     const accessToken = await getAccessToken();

//     const orderResponse = await axios.post(
//       "https://api-m.sandbox.paypal.com/v2/checkout/orders",
//       {
//         intent: "AUTHORIZE", // NOT "CAPTURE"
//         purchase_units: [
//           {
//             amount: {
//               currency_code: currency || "USD",
//               value: amount,
//             },
//             reference_id: userId, // for tracking
//           },
//         ],
//         application_context: {
//           return_url: "http://your-backend.com/api/v1/user/account/payment/paypalsuccess",
//           cancel_url: "http://your-backend.com/api/v1/user/account/payment/paypalcancel",
//         },
//       },
//       {
//         headers: {
//           Authorization: `Bearer ${accessToken}`,
//           "Content-Type": "application/json",
//         },
//       }
//     );

//     // Save initial order in DB
//     await createDocument("userPayment", {
//       userId,
//       paypalOrderId: orderResponse.data.id,
//       status: "CREATED",
//     });

//     const approveUrl = orderResponse.data.links.find(link => link.rel === "approve").href;
//     res.status(200).json({ url: approveUrl });

//   } catch (error) {
//     console.error("Error creating PayPal order:", error.response?.data || error.message);
//     res.status(500).json({ error: "Something went wrong" });
//   }
// };

// export default createOrder;




// import axios from "axios";
// import getAccessToken from "../../../../helpers/accessToken.js";
// import { updateDocument } from "../../../../helpers/index.js";

// const paypalSuccess = async (req, res) => {
//   try {
//     const { token } = req.query; // token = orderId
//     const accessToken = await getAccessToken();

//     const authorizeResponse = await axios.post(
//       `https://api-m.sandbox.paypal.com/v2/checkout/orders/${token}/authorize`,
//       {},
//       {
//         headers: {
//           Authorization: `Bearer ${accessToken}`,
//           "Content-Type": "application/json",
//         },
//       }
//     );

//     const authorizationId = authorizeResponse.data.purchase_units[0].payments.authorizations[0].id;

//     await updateDocument(
//       "userPayment",
//       { paypalOrderId: token },
//       {
//         status: "AUTHORIZED",
//         authorizationId: authorizationId,
//         payerInfo: authorizeResponse.data.payer,
//       }
//     );

//     console.log("Payment Authorized:", authorizeResponse.data);
//     return res.send("<html><body style='background:#fff;'>Payment Authorized</body></html>");

//   } catch (error) {
//     console.error("Error authorizing PayPal payment:", error.response?.data || error.message);
//     res.redirect("http://your-backend.com/api/v1/user/account/payment/paypalcancel");
//   }
// };

// export default paypalSuccess;




// import { deleteDocument } from "../../../../helpers/index.js";

// const paymentCancel = async (req, res) => {
//   try {
//     const { token } = req.query;

//     await deleteDocument("userPayment", {
//       paypalOrderId: token,
//     });

//     return res.send("<html><body style='background:#fff;'>Payment Cancelled</body></html>");
//   } catch (error) {
//     return res.status(400).json({ status: 400, message: error.message });
//   }
// };

// export default paymentCancel;




// import axios from "axios";
// import getAccessToken from "../../../../helpers/accessToken.js";
// import { updateDocument } from "../../../../helpers/index.js";

// const capturePayment = async (req, res) => {
//   try {
//     const { authorizationId } = req.body; // from DB

//     const accessToken = await getAccessToken();

//     const captureResponse = await axios.post(
//       `https://api-m.sandbox.paypal.com/v2/payments/authorizations/${authorizationId}/capture`,
//       {},
//       {
//         headers: {
//           Authorization: `Bearer ${accessToken}`,
//           "Content-Type": "application/json",
//         },
//       }
//     );

//     await updateDocument(
//       "userPayment",
//       { authorizationId },
//       {
//         status: "CAPTURED",
//         captureId: captureResponse.data.id,
//       }
//     );

//     console.log("Payment Captured Successfully:", captureResponse.data);
//     res.status(200).json({ message: "Payment Captured Successfully" });

//   } catch (error) {
//     console.error("Error capturing payment:", error.response?.data || error.message);
//     res.status(500).json({ error: "Something went wrong" });
//   }
// };

// export default capturePayment;


// import axios from "axios";
// import getAccessToken from "../../../../helpers/accessToken.js";

// const sendPayout = async (req, res) => {
//   try {
//     const { receiverEmail, amount } = req.body;

//     const accessToken = await getAccessToken();

//     const payoutResponse = await axios.post(
//       "https://api-m.sandbox.paypal.com/v1/payments/payouts",
//       {
//         sender_batch_header: {
//           sender_batch_id: `batch-${Date.now()}`,
//           email_subject: "You have a payment",
//         },
//         items: [
//           {
//             recipient_type: "EMAIL",
//             amount: {
//               value: amount,
//               currency: "USD",
//             },
//             receiver: receiverEmail,
//             note: "Thanks for using our service",
//           },
//         ],
//       },
//       {
//         headers: {
//           Authorization: `Bearer ${accessToken}`,
//           "Content-Type": "application/json",
//         },
//       }
//     );

//     console.log("Payout Success:", payoutResponse.data);
//     res.status(200).json({ message: "Payout Sent Successfully" });

//   } catch (error) {
//     console.error("Error sending payout:", error.response?.data || error.message);
//     res.status(500).json({ error: "Something went wrong" });
//   }
// };

// export default sendPayout;





// import express from "express";
// import createOrder from "../controllers/payment/createOrder.js";
// import paypalSuccess from "../controllers/payment/paypalSuccess.js";
// import paymentCancel from "../controllers/payment/paymentCancel.js";
// import capturePayment from "../controllers/payment/capturePayment.js";
// import sendPayout from "../controllers/payment/sendPayout.js";

// const router = express.Router();

// router.post("/create-order", createOrder);
// router.get("/paypalsuccess", paypalSuccess);
// router.get("/paypalcancel", paymentCancel);
// router.post("/capture-payment", capturePayment); // after service completed
// router.post("/send-payout", sendPayout); // to pay pro

// export default router;



// User → Create Order (intent: AUTHORIZE)
//     ↓
// User Approves on PayPal
//     ↓
// Backend → Authorize Payment
//     ↓
// Wait Until Service Complete
//     ↓
// Admin → Capture Authorization
//     ↓
// Admin → Send Payout to Pro
