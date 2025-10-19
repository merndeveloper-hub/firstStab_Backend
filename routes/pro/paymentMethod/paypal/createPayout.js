import Joi from "joi";
import { findOne, updateDocument } from "../../../../helpers/index.js";



// ==========================================
// 6. CREATE PAYOUT (Send money to user)
// ==========================================

const createPayoutSchema = Joi.object({
  userId: Joi.string().required(),
  amount: Joi.number().positive().required(),
  currency: Joi.string().default("USD"),
  note: Joi.string().optional()
});

const createPayout = async (req, res) => {
  try {
    await createPayoutSchema.validateAsync(req.body);

    const { userId, amount, currency, note } = req.body;

    const user = await findOne("user", { _id: userId });
    if (!user || user.length === 0) {
      return res.status(400).json({ 
        status: 400, 
        message: "User not found" 
      });
    }

    if (!user.paypalEmail) {
      return res.status(400).json({
        status: 400,
        message: "User has no PayPal account connected"
      });
    }

    // Create payout using REST API
    const payoutBatch = {
      sender_batch_header: {
        sender_batch_id: `payout_${Date.now()}_${userId}`,
        email_subject: "You have a payout!",
        email_message: note || "You have received a payout. Thanks for using our service!"
      },
      items: [{
        recipient_type: "EMAIL",
        amount: {
          value: amount.toFixed(2),
          currency: currency
        },
        note: note || "Payout from platform",
        sender_item_id: `item_${Date.now()}`,
        receiver: user.paypalEmail
      }]
    };

    // Use fetch for PayPal REST API
    const auth = Buffer.from(
      `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`
    ).toString('base64');

    const baseURL = process.env.NODE_ENV === "production" 
      ? "https://api-m.paypal.com"
      : "https://api-m.sandbox.paypal.com";

    const response = await fetch(`${baseURL}/v1/payments/payouts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${auth}`
      },
      body: JSON.stringify(payoutBatch)
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Payout failed");
    }

    // Mark user as verified after first successful payout
    if (!user.paypalVerified) {
      await updateDocument("user", 
        { _id: userId }, 
        { paypalVerified: true }
      );
    }

    return res.status(200).json({
      status: 200,
      message: "Payout created successfully",
      data: {
        batchId: result.batch_header.payout_batch_id,
        batchStatus: result.batch_header.batch_status,
        amount: amount,
        currency: currency,
        paypalEmail: user.paypalEmail,
        note: "Payout will be processed within 24 hours"
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

export default createPayout;