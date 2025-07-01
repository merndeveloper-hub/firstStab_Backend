// File: routes/pro/stripeOnboarding.js

import { findOne, updateDocument } from "../../../helpers/index.js";
import Stripe from "stripe";

let stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const startStripeOnboarding = async (req, res) => {
  try {
    const { professionalId } = req.body;

    const pro = await findOne("payment", { professionalId });

    if (!pro) {
      return res.status(404).json({ message: "Professional not found" });
    }

    // You must have 'country' in your pro object. Fallback to 'US' if not set.
    const country = "US";

    // Optional: use pro.email if available
 //   const email = pro.email || "default@email.com";
const email = 'owaisy028@gmail.com'
    // Create Express Stripe Account
   const account = await stripe.accounts.create({
  type: "express",
  country,
  email, 
  capabilities: {
    transfers: { requested: true },
  },
  business_type: "individual",
  
});

// Update after creation (for US only)
if (country === "US") {
  await stripe.accounts.update(account.id, {
    metadata: { tax_form_required: "true" },
    settings: {
      payouts: {
        schedule: { interval: "manual" },
      },
    },
  });
}


    // Save Stripe Account ID
    await updateDocument("payment", { professionalId }, { stripeAccountId: account.id });
const accounts = await stripe.accounts.retrieve(pro.stripeAccountId);

//if (!accounts.individual?.ssn_last_4 && country == 'US') {
  // Missing tax info, re-initiate onboarding
  const accountLink = await stripe.accountLinks.create({
    account: account.id,
    refresh_url: 'https://yourdomain.com/stripe/onboarding/refresh',
    return_url: `https://yourdomain.com/stripe/onboarding/return?accountId=${account.id}&proId=${pro._id}`,
    type: 'account_onboarding',
  });

  const taxForm = await stripe.testHelpers.tax.forms1099Nec.create({
    account: account.id,
    year: 2024,
    status: 'available',
  });

  console.log('📄 Simulated 1099-NEC:', taxForm);


  return res.status(200).json({
    message: 'Re-initiated onboarding for missing tax info',
    onboardingUrl: accountLink.url,
  });
//}

  } catch (error) {
    console.error("Stripe onboarding error:", error);
    return res.status(500).json({ message: error.message });
  }
};

export default startStripeOnboarding;
