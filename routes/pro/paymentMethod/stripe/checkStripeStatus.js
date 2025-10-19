import Stripe from "stripe";
import Joi from "joi";
import { findOne,updateDocument } from "../../../../helpers/index.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// ==========================================
// 2. CHECK STRIPE ACCOUNT STATUS
// ==========================================

const checkStripeStatusSchema = Joi.object({
  id: Joi.string().required()
});

const checkStripeStatus = async (req, res) => {
  try {
    await checkStripeStatusSchema.validateAsync(req.params);

    const { id } = req.params;

    const user = await findOne("user", { _id: id });
    if (!user || user.length === 0) {
      return res.status(400).json({ 
        status: 400, 
        message: "User not found" 
      });
    }

    if (!user.stripeAccountId) {
      return res.status(200).json({
        status: 200,
        message: "No Stripe account found",
        data: {
          hasAccount: false,
          needsOnboarding: true
        }
      });
    }

    // Get account details from Stripe
    const account = await stripe.accounts.retrieve(user.stripeAccountId);

    // Update user status in database
    await updateDocument("user", 
      { _id: id }, 
      {
        stripeAccountStatus: account.charges_enabled ? "active" : "restricted",
        onboardingCompleteStripe: account.details_submitted
      }
    );

    return res.status(200).json({
      status: 200,
      message: "Stripe account status retrieved",
      data: {
        hasAccount: true,
        accountId: user.stripeAccountId,
        status: account.charges_enabled ? "active" : "restricted",
        onboardingCompleteStripe: account.details_submitted,
        chargesEnabled: account.charges_enabled,
        payoutsEnabled: account.payouts_enabled,
        requirements: account.requirements,
        currentlyDue: account.requirements?.currently_due || [],
        eventuallyDue: account.requirements?.eventually_due || []
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

export default checkStripeStatus;