import Stripe from "stripe";
import Joi from "joi";
import {
  findOne,
  insertNewDocument,
  updateDocument,
} from "../../../../helpers/index.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// ==========================================
// Transfer from Admin Stripe to User Stripe
// ==========================================

const createTransferSchema = Joi.object({
  userId: Joi.string().required(),
  amount: Joi.number().positive().required(),
  currency: Joi.string().default("usd"),
  description: Joi.string().optional(),
  serviceId: Joi.string().optional(),
});

const createPayout = async (req, res) => {
  try {
    await createTransferSchema.validateAsync(req.body);

    const { userId, amount, currency, description, serviceId } = req.body;

    // User ko find karo
    const user = await findOne("user", { _id: userId });
    if (!user || user.length === 0) {
      return res.status(400).json({
        status: 400,
        message: "User not found",
      });
    }

    // Check karo ke user ka Stripe Connected Account hai
    if (!user.stripeAccountId) {
      return res.status(400).json({
        status: 400,
        message:
          "User has no Stripe Connected Account. User needs to complete onboarding first.",
      });
    }

    // Optional: Check karo ke user ka onboarding complete hai
    if (!user.onboardingCompleteStripe) {
      return res.status(400).json({
        status: 400,
        message: "User needs to complete Stripe onboarding first",
      });
    }

    // IMPORTANT: Check karo ke currentBalance se zyada request toh nahi kar raha
    if (amount > user.currentBalance) {
      return res.status(400).json({
        status: 400,
        message: "Requested amount exceeds current balance",
        data: {
          requested: amount,
          available: user.currentBalance,
          currency: currency,
        },
      });
    }

    // Admin ke balance ko check karo
    const platformBalance = await stripe.balance.retrieve();
    const availableAmount =
      platformBalance.available.find((b) => b.currency === currency)?.amount ||
      0;

    if (availableAmount < amount * 100) {
      return res.status(400).json({
        status: 400,
        message: "Insufficient platform balance",
        data: {
          requested: amount,
          available: availableAmount / 100,
          currency: currency,
        },
      });
    }

    // Transfer create karo from platform to user
    const transfer = await stripe.transfers.create({
      amount: amount * 100,
      currency: currency,
      destination: user.stripeAccountId,
      description: description || `Payment for service ${serviceId || ""}`,
      metadata: {
        userId: userId,
        serviceId: serviceId || "",
        timestamp: new Date().toISOString(),
      },
    });

    // ==========================================
    // USER FIELDS UPDATE KARO
    // ==========================================

    // Current balance se amount minus karo (kyunki ab admin ne pay kar diya)
    const updatedBalance = user.currentBalance - amount;

    // User document update karo
    const updateResult = await updateDocument(
      "user",
      { _id: userId },
      {
        currentBalance: updatedBalance < 0 ? 0 : updatedBalance, // Negative na ho
        updatedAt: new Date(),
      }
    );

    paymentUpdateResult = await insertNewDocument(
      "userPayment",

      {
        paymentMethod: "Paypal",
        sender: "Admin",
        reciever: "Pro",
        status: "Paid", // Pending -> Paid
        payout_batch_id: transfer.id, // Stripe transfer ID save karo
        batch_status: "Success", // Pending -> Success
        updatedAt: new Date(),
      }
    );

    if (!updateResult) {
      // Agar update fail ho toh warning do (but transfer successful hai)
      console.error("Failed to update user balance after transfer");
    }

    return res.status(200).json({
      status: 200,
      message: "Transfer completed successfully",
      data: {
        transferId: transfer.id,
        amount: transfer.amount / 100,
        currency: transfer.currency,
        destination: transfer.destination,
        status: "completed",
        created: new Date(transfer.created * 1000).toISOString(),
        userBalance: {
          previousBalance: user.currentBalance,
          paidAmount: amount,
          remainingBalance: updatedBalance < 0 ? 0 : updatedBalance,
        },
      },
    });
  } catch (e) {
    console.error("Transfer Error:", e);

    if (e.type === "StripeInvalidRequestError") {
      return res.status(400).json({
        status: 400,
        message: "Invalid transfer request",
        error: e.message,
      });
    }

    if (e.type === "StripeConnectionError") {
      return res.status(500).json({
        status: 500,
        message: "Connection error with Stripe",
      });
    }

    return res.status(400).json({
      status: 400,
      message: e.message,
    });
  }
};

export default createPayout;
