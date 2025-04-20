import Twilio from "twilio"; // Default import for Twilio
import { insertNewDocument } from "../../../helpers/index.js"; // Assuming this is the DB helper
import Joi from "joi";

const { AccessToken } = Twilio.jwt;
const ChatGrant = AccessToken.ChatGrant;

const schemaBody = Joi.object().keys({
  professsionalId: Joi.string().required(),
  chatChannelName: Joi.string().required(),

  proServiceId: Joi.string(),
 
  bookServiceId: Joi.string(),
  userAccpetBookingId: Joi.string(),
});

const twilioChatToken = async (req, res) => {
  console.log("Generating Twilio Chat Token");

  try {
    // Get user identity and channel from the request body
    const { professsionalId, chatChannelName } = req.body;
    console.log(req.body, "body");

    if (!professsionalId || !chatChannelName) {
      return res
        .status(400)
        .json({ error: "userId and channelName are required" });
    }

    // Twilio credentials
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const apiKeySid = process.env.TWILIO_API_KEY_SID;
    const apiKeySecret = process.env.TWILIO_API_KEY_SECRET;

    // Create an Access Token
    const token = new AccessToken(accountSid, apiKeySid, apiKeySecret, {
      identity: professsionalId, // The identity of the user (use userId for login)
    });

    // Create a ChatGrant (this grant allows the user to access Twilio Chat)
    const chatGrant = new ChatGrant({
      serviceSid: process.env.TWILIO_CHAT_SERVICE_SID, // Twilio Chat Service SID
      channel: chatChannelName, // Specify the channel to join
    });

    token.addGrant(chatGrant);

    // Generate the JWT token
    const jwt = token.toJwt();
    if (!jwt || jwt.length == 0) {
      return res.status(400).json({ error: "Failed to start chat" });
    }
    const insertServiceDetails = await insertNewDocument("serviceDetail", {
      ...req.body,
      token: jwt,
    });
   
    
    // Return the token as JSON response
    return res
      .status(201)
      .json({ status: 201, token: jwt, serviceDetail: insertServiceDetails });
  } catch (error) {
    console.error("Error generating Twilio Chat token:", error);
    return res.status(400).json({ error: "Failed to start chat" });
  }
};

export default twilioChatToken;
