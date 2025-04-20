import Twilio from "twilio"; // Default import for Twilio
import { insertNewDocument } from "../../../helpers/index.js";

import Joi from "joi";
const { AccessToken } = Twilio.jwt;
const VideoGrant = AccessToken.VideoGrant;

const schemaBody = Joi.object().keys({
  professsionalId: Joi.string().required(),
  videoRoomName: Joi.string().required(),
  proServiceId: Joi.string(),
  
  bookServiceId: Joi.string(),
  userAccpetBookingId: Joi.string(),
});

const twilioToken = async (req, res) => {
  await schemaBody.validateAsync(req.body);
  try {
    // Get userId and videoRoomName from the request body
    const { professsionalId, videoRoomName } = req.body;
    console.log(req.body, "body");

    // Create the token with required credentials and user identity
    const token = new AccessToken(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_API_KEY_SID,
      process.env.TWILIO_API_KEY_SECRET,
      { identity: professsionalId } // Use 'identity' for user identification
    );

    console.log(token, "token");

    // Create a VideoGrant for the specified room
    const videoGrant = new VideoGrant({
      room: videoRoomName, // Correct parameter is 'room'
    });

    console.log(videoGrant, "videoGrant");

    // Add the grant to the token
    token.addGrant(videoGrant);
    console.log("in");

    // Generate the JWT token
    const jwt = token.toJwt();
    console.log(jwt, "jwt");
    if (!jwt || jwt.length == 0) {
      return res.status(400).json({ error: "Failed to start video call" });
    }
    const insertServiceDetails = await insertNewDocument("serviceDetail", {
      ...req.body,
      token: jwt,
    });
    // Return the token as JSON
    return res.json({
      status: 201,
      token: jwt,
      serviceDetail: insertServiceDetails,
    });
  } catch (error) {
    return res.status(400).json({ error: "Failed to start video call" });
  }
};

export default twilioToken;
