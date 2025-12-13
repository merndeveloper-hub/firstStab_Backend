import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET;

const getAccessToken = async () => {
  try {
    const BASE_URL = process.env.PAYPAL_API_DEVELOPMENT_URL;

    const response = await axios.post(
      `${BASE_URL}/v1/oauth2/token`,
      "grant_type=client_credentials",
      {
        auth: {
          username: PAYPAL_CLIENT_ID,
          password: PAYPAL_CLIENT_SECRET,
        },
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    // RETURN TOKEN ON SUCCESS
     return response.data.access_token;

  } catch (error) {
    console.error("PayPal Token Error:", error.response?.data || error.message);

    // HANDLE 401 ERROR RETURN CLEAN RESPONSE
    if (error.response && error.response.status === 401) {
      return {
        success: false,
        status: 401,
        message: "PayPal Unauthorized - Check CLIENT_ID/SECRET",
        details: error.response.data,
      };
    }

    // GENERIC ERROR
    return {
      success: false,
      status: error.response?.status || 500,
      message: error.message,
      details: error.response?.data || null,
    };
  }
};

export default getAccessToken;
