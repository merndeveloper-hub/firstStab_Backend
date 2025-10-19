import Joi from "joi";
import { findOne, updateDocument } from "../../../../helpers/index.js";


// ==========================================
// 3. UPDATE PAYPAL EMAIL
// ==========================================

const updatePayPalEmailSchema = Joi.object({
  userId: Joi.string().required(),
  paypalEmail: Joi.string().email().required()
});

const updatePayPalEmail = async (req, res) => {
  try {
    await updatePayPalEmailSchema.validateAsync(req.body);

    const { userId, paypalEmail } = req.body;

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
        paypalEmail: paypalEmail,
        paypalVerified: false // Reset verification
      }
    );

    return res.status(200).json({
      status: 200,
      message: "PayPal email updated successfully",
      data: {
        paypalEmail: paypalEmail
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


export default updatePayPalEmail;