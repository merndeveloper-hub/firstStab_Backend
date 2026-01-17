import Joi from "joi";
import { findOne, updateDocument } from "../../../../helpers/index.js";

// ==========================================
// 1. CONNECT PAYPAL ACCOUNT (Save PayPal Email)
// ==========================================

const connectPayPalSchema = Joi.object({
  userId: Joi.string().required(),
  paypalEmail: Joi.string().email().required(),
  firstName: Joi.string().required(),
  lastName: Joi.string().required(),
  country: Joi.string().default("US")
});

const connectPayPalAccount = async (req, res) => {
  try {
    await connectPayPalSchema.validateAsync(req.body);

    const { userId, paypalEmail, firstName, lastName, country } = req.body;

    // Check if user exists
    const user = await findOne("user", { _id: userId });
    if (!user || user.length === 0) {
      return res.status(400).json({ 
        status: 400, 
        message: "User not found" 
      });
    }

    // Check if user already has PayPal account
    if (user.paypalEmail) {
      return res.status(400).json({
        status: 400,
        message: "User already has a PayPal account connected",
        data: { paypalEmail: user.paypalEmail }
      });
    }

    // Update user with PayPal info
    await updateDocument("user", 
      { _id: userId }, 
      { 
        paypalEmail: paypalEmail,
        paypalFirstName: firstName,
        paypalLastName: lastName,
        paypalCountry: country,
        paypalConnected: true,
        paypalVerified: true // Will be verified on first payout
      }
    );

    return res.status(200).json({
      status: 200,
      message: "PayPal account connected successfully",
      data: {
        paypalEmail: paypalEmail,
        connected: true,
        note: "PayPal account will be verified on first payout"
      }
    });

  } catch (e) {
    console.log(e);
    return res.status(400).json({ 
      status: 400, 
      message: e.message 
    });
  }
};


export default connectPayPalAccount;