import Joi from "joi";
import { findOne, updateDocument } from "../../../../helpers/index.js";


// ==========================================
// 10. DISCONNECT PAYPAL ACCOUNT
// ==========================================

const disconnectPayPalSchema = Joi.object({
  userId: Joi.string().required()
});

const disconnectPayPalAccount = async (req, res) => {
  try {
    await disconnectPayPalSchema.validateAsync(req.params);

    const { userId } = req.params;

    const user = await findOne("user", { _id: userId });
    if (!user || user.length === 0) {
      return res.status(400).json({ 
        status: 400, 
        message: "User not found" 
      });
    }

    await updateDocument("user", 
      { _id: userId }, 
      { 
        paypalEmail: null,
        paypalFirstName: null,
        paypalLastName: null,
        paypalCountry: null,
        paypalConnected: false,
        paypalVerified: false
      }
    );

    return res.status(200).json({
      status: 200,
      message: "PayPal account disconnected successfully"
    });

  } catch (e) {
    console.log(e);
    return res.status(400).json({ 
      status: 400, 
      message: e.message 
    });
  }
};

export default disconnectPayPalAccount;