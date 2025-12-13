import Stripe from "stripe";
import Joi from "joi";
import { findOne } from "../../../../helpers/index.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);



// ==========================================
// 3. GENERATE NEW ONBOARDING LINK
// ==========================================

const generateOnboardingSchema = Joi.object({
  userId: Joi.string().required()
});

const generateOnboardingLink = async (req, res) => {
  try {
    await generateOnboardingSchema.validateAsync(req.params);

    const { userId } = req.params;

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
        message: "User has no Stripe account. Create account first."
      });
    }



    // Generate fresh onboarding link
    const accountLink = await stripe.accountLinks.create({
      account: user.stripeAccountId,
       refresh_url: `${process.env.BACKEND_URL}/api/v1/pro/paymentMethod/stripe/refreshonboarding?userId=${userId}`,
      // return_url: `${process.env.BASE_URL}/api/stripe/return?userId=${userId}`,
      return_url: `${process.env.BACKEND_URL}/api/v1/pro/paymentMethod/stripe/afteronboarding?userId=${userId}`,
      type: "account_onboarding",
    });

    return res.status(200).json({
      status: 200,
      message: "Onboarding link generated",
      data: {
        onboardingUrl: accountLink.url
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

export default generateOnboardingLink;
