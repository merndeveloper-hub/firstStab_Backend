import Stripe from "stripe";
import Joi from "joi";
import { findOne, updateDocument } from "../../../../helpers/index.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// ==========================================
// 1. CREATE STRIPE ACCOUNT
// ==========================================

const createStripeAccountSchema = Joi.object({
 // email: Joi.string().email().required(),
  firstName: Joi.string().required(),
  lastName: Joi.string().required(),
  //phone: Joi.string().required(),
  country: Joi.string().default("US"),
  userId: Joi.string().required(),
  email: Joi.string()
      .email({ tlds: { allow: true } }) // Ensures a valid domain with TLD (e.g., .com, .org)
      .pattern(new RegExp("^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$")) // Enforces common email rules
      .required()
      .messages({
        "string.email": "Invalid email format",
        "any.required": "Email is required",
        "string.pattern.base": "Invalid email structure",
      }),
    phone: Joi.string()
      .required()
      .messages({
        "string.pattern.base": "Mobile number must be digits",
        "any.required": "Mobile number is required.",
      }),
});

const createStripeAccount = async (req, res) => {
  try {
    await createStripeAccountSchema.validateAsync(req.body);

    const { email, firstName, lastName, phone, country, userId } = req.body;

    // Check if user exists
    const user = await findOne("user", { _id: userId });
    if (!user || user.length === 0) {
      return res.status(400).json({
        status: 400,
        message: "User not found",
      });
    }

    // Check if user already has Stripe account
    if (user.stripeAccountId) {
      return res.status(400).json({
        status: 400,
        message: "User already has a Stripe account",
        data: { stripeAccountId: user.stripeAccountId },
      });
    }

    // Create Stripe Connected Account
    const account = await stripe.accounts.create({
      type: "express",
      country: country,
      email: email,
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
      business_type: "individual",
      individual: {
        email: email,
        first_name: firstName,
        last_name: lastName,
        phone: phone,
      },
    });

    // Update user with Stripe account ID
    await updateDocument(
      "user",
      { _id: userId },
      {
        stripeAccountId: account.id,
        stripeAccountStatus: "pending",
        // onboardingComplete: false
        onboardingCompleteStripe: false,
      }
    );

    // Generate onboarding link
    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: `http://localhost:5000/api/v1/pro/paymentMethod/stripe/refreshonboarding?userId=${userId}`,
      // return_url: `${process.env.BASE_URL}/api/stripe/return?userId=${userId}`,
      return_url: `http://localhost:5000/api/v1/pro/paymentMethod/stripe/afteronboarding?userId=${userId}`,
      type: "account_onboarding",
    });

    return res.status(200).json({
      status: 200,
      message: "Stripe account created successfully",
      data: {
        stripeAccountId: account.id,
        onboardingUrl: accountLink.url,
       
      },
    });
  } catch (e) {
    console.log(e);
    return res.status(400).json({
      status: 400,
      message: e.message,
    });
  }
};

export default createStripeAccount;
