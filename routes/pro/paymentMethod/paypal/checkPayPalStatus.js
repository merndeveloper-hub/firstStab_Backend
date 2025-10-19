import Joi from "joi";
import { findOne } from "../../../../helpers/index.js";

// ==========================================
// 2. CHECK PAYPAL CONNECTION STATUS  --> done
// ==========================================

const checkPayPalStatusSchema = Joi.object({
  id: Joi.string().required()
});

const checkPayPalStatus = async (req, res) => {
  try {
    await checkPayPalStatusSchema.validateAsync(req.params);

    const { id } = req.params;

    const user = await findOne("user", { _id: id });
    if (!user || user.length === 0) {
      return res.status(400).json({ 
        status: 400, 
        message: "User not found" 
      });
    }

    if (!user.paypalEmail) {
      return res.status(200).json({
        status: 200,
        message: "No PayPal account connected",
        data: {
          hasAccount: false,
          needsConnection: true
        }
      });
    }

    return res.status(200).json({
      status: 200,
      message: "PayPal account status retrieved",
      data: {
        hasAccount: true,
        paypalEmail: user.paypalEmail,
        connected: user.paypalConnected || false,
        verified: user.paypalVerified || false,
        firstName: user.paypalFirstName,
        lastName: user.paypalLastName
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

export default checkPayPalStatus;