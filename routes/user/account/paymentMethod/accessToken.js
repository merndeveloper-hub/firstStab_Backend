const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET;

import axios from "axios";

const getAccessToken = async (req, res) => {
  try {
    const BASE_URL = process.env.PAYPAL_API_DEVELOPMENT_URL; // Use live URL in production

    const response = await axios.post(
      `${BASE_URL}/v1/oauth2/token`,
      "grant_type=client_credentials",
      {
        auth: { username: PAYPAL_CLIENT_ID, password: PAYPAL_CLIENT_SECRET },
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      }
    );
    if (!response || response.length == 0) {
      return res
        .status(400)
        .json({ status: 400, message: "Authorization failed!" });
    }

    return response.data.access_token;
  } catch (error) {
    console.log(error, "error");
    return res.status(400).json({ status: 400, message: error.message });
   
  }
};

export default getAccessToken;
