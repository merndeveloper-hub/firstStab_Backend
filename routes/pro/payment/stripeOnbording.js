// File: routes/pro/stripeOnboarding.js

import { findOne, updateDocument } from "../../../helpers/index.js";

import Stripe from "stripe";


let stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const startStripeOnboarding = async (req, res) => {
  try {
    const { professionalId } = req.body;

    const pro = await findOne("payment", { professionalId });

  console.log(pro,"pro----");
  

    let stripeAccountId = pro.stripeAccountId;
console.log(stripeAccountId,"stripeAccountId");

    // If Pro doesn't have a Stripe account, create one
    if (!stripeAccountId) {
      console.log("if");
      

      
      const account = await stripe.customers.create({
        type: "express",
        country:  "US",
        email: "jifafa1212@nab4.com",
        capabilities: {
          transfers: { requested: true },
        },
      });

console.log(account,"account---");


      stripeAccountId = account.id;

      // Save the account ID in your DB
      await updateDocument("payment", {  professionalId }, { stripeAccountId });
    }

    // Create onboarding link
    const accountLink = await stripe.accountLinks.create({
      account: stripeAccountId,
      refresh_url: `https://yourdomain.com/stripe/onboarding/refresh`,
      return_url: `https://yourdomain.com/stripe/onboarding/return?accountId=${stripeAccountId}&proId=${pro._id}`,
      type: "account_onboarding",
    });
console.log(accountLink,"accountLink");

    return res.status(200).json({
      message: "Stripe onboarding started",
      onboardingUrl: accountLink.url,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};


export default startStripeOnboarding;