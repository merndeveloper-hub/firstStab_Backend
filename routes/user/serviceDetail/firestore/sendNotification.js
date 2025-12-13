import { findOne } from "../../../../helpers/index.js";
import admin from "../../../../config/firebase/firebaseConfig.js";

const isValidToken = (token) => typeof token === "string" && token.length > 0;

const sendNotification = async (req, res) => {
  try {
    console.log("📨 Notification Request:", req.body);
    const { fcmToken, title, body, senderId, receiverId } = req.body;

    // Validation
    if (!isValidToken(fcmToken) || !title || !body) {
      return res.status(400).json({
        status: 400,
        message: "fcmToken, title, and body are required",
      });
    }

    // Sender check
    const sender = await findOne("user", { _id: senderId });
    if (!sender) {
      return res.status(400).json({ status: 400, message: "Sender not found" });
    }

    // Receiver check
    const receiver = await findOne("user", { _id: receiverId });
    if (!receiver) {
      return res.status(400).json({ status: 400, message: "Receiver not found" });
    }

    // Message payload
    const message = {
      token: fcmToken,
      notification: {
        title,
        body,
      },
      data: {
        senderId: String(senderId),
        receiverId: String(receiverId),
        timestamp: String(Date.now()),
      },
    };

    console.log("🚀 Sending FCM message...");

    // Admin SDK handles OAuth internally
    const response = await admin.messaging().send(message);

    console.log("✅ Notification sent successfully");
    console.log("📬 Message ID:", response);

    return res.status(200).json({
      status: 200,
      message: "Notification sent successfully",
      messageId: response,
    });

  } catch (error) {
    console.error("❌ FCM Error:", error.code || error.message);

    let statusCode = 500;
    let errorMessage = "Failed to send notification";

    if (
      error.code === "messaging/invalid-registration-token" ||
      error.code === "messaging/registration-token-not-registered"
    ) {
      statusCode = 400;
      errorMessage = "Invalid or expired FCM token";
    } else if (error.code === "messaging/third-party-auth-error") {
      statusCode = 500;
      errorMessage = "Firebase authentication error";
    }

    return res.status(statusCode).json({
      status: statusCode,
      message: errorMessage,
      error: error.code,
      details: error.message,
    });
  }
};

export default sendNotification;