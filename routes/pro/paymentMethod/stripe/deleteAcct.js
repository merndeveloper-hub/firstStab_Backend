import Stripe from "stripe";
import Joi from "joi";
import { findOne, updateDocument } from "../../../../helpers/index.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);



// ==========================================
// 15. DELETE STRIPE ACCOUNT (Permanent)
// ==========================================

const deleteAccountSchema = Joi.object({
  userId: Joi.string().required(),
  confirmDelete: Joi.boolean().valid(true).required()
});

const deleteStripeAccount = async (req, res) => {
  try {
    await deleteAccountSchema.validateAsync({
      ...req.params,
      ...req.body
    });

    const { userId } = req.params;
    const { confirmDelete } = req.body;

    const user = await findOne("user", { _id: userId });
    if (!user || user.length === 0) {
      return res.status(400).json({ 
        status: 400, 
        message: "User not found" 
      });
    }

    if (!user.stripeAccountId) {
      return res.status(400).json({
        status: 400,
        message: "User has no Stripe account to delete"
      });
    }

    // Check for pending balance
    const balance = await stripe.balance.retrieve({
      stripeAccount: user.stripeAccountId,
    });

    const totalPending = balance.pending.reduce((sum, b) => sum + b.amount, 0);
    const totalAvailable = balance.available.reduce((sum, b) => sum + b.amount, 0);

    if (totalPending > 0 || totalAvailable > 0) {
      return res.status(400).json({
        status: 400,
        message: "Cannot delete account with funds",
        data: {
          availableBalance: totalAvailable / 100,
          pendingBalance: totalPending / 100,
          recommendation: "Please withdraw all funds before deleting"
        }
      });
    }

    // Delete Stripe account
    const deletedAccount = await stripe.accounts.del(user.stripeAccountId);

    if (deletedAccount.deleted) {
      // Remove Stripe data from user
      await updateDocument("user", 
        { _id: userId }, 
        { 
          $unset: {
            stripeAccountId: "",
            stripeAccountStatus: "",
            onboardingCompleteStripe: "",
            stripeAccountDisconnectedAt: ""
          }
        }
      );

      return res.status(200).json({
        status: 200,
        message: "Stripe account permanently deleted",
        data: {
          userId: userId,
          deleted: true,
          deletedAccountId: user.stripeAccountId,
          warning: "This action is irreversible. User needs to create new account."
        }
      });
    } else {
      throw new Error("Failed to delete Stripe account");
    }

  } catch (e) {
    console.log(e);
    return res.status(400).json({ 
      status: 400, 
      message: e.message 
    });
  }
};


export default deleteStripeAccount;