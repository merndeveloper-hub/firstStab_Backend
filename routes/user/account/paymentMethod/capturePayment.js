
//import paypal from 'paypal-rest-sdk';
import axios from 'axios';
import getAccessToken from './accessToken.js';


// paypal.configure({
//   "PAYPAL_CLIENT_ID":"AU-T3vm80bzgk_ygC6zvO4ECrLDxqCVsquch2-Rd_Xpakj--1C8o6pkdkBSqFxEnI9y52hGHpLJJnJ71",
// "PAYPAL_CLIENT_SECRET":"EOmvmBOo_wLM_6JhuSAvCwCxaDg4ye6eR9Pt9JqyYh_lCx-zTz7X2_leuhb1w6RJuRGB2SD4TVUZUdBa",
// "PAYPAL_MODE":"sandbox"

// });
const BASE_URL = "https://api-m.sandbox.paypal.com"; // Use live URL in production
const capturePayment = async (req, res) => {

    try {

      const { orderID } = req.body;
      const getToken = await getAccessToken()
      console.log(getToken,"getToke");

      // const response = await axios.post(
      //     `${BASE_URL}/v2/checkout/orders/${orderID}/capture`,
      //     {},
      //     {
      //         headers: {
      //             Authorization: `Bearer ${getToken}`,
      //             "Content-Type": "application/json",
      //         },
      //     }
      // );
console.log(orderID,"ORDER");

      const response = await axios.post(
        "https://api-m.sandbox.paypal.com/v2/checkout/orders/3M027863FD980352X/capture",
        {},
        { headers: { Authorization: `Bearer ${getToken}`, "Content-Type": "application/json" } }
    );

console.log(response,"response");

 
      return res
      .status(201)
      .json({ status: 201, data: response.data });

    } catch (error) {
      console.error("Error capturing payment:", error.response?.data || error.message);
      return res.status(500).json({
        status: 500,
        message: "Failed to capture payment",
        error: error.message,
      });
    }

}

export default capturePayment;