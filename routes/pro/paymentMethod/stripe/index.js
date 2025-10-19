

import express from "express";



import createStripeAccount from "./AddStripe.js";

import onboardingReauth from "./onboardingReauth.js";


import onboardingReturn from "./onboardingReturn.js";
import checkStripeStatus from "./checkStripeStatus.js";
import createPayout from "./createPayout.js";
import checkAcctStatus from "./getBothAcc.js";
import generateOnboardingLink from "./generateOnboardingLink.js";
import deleteStripeAccount from "./deleteAcct.js";
const router = express.Router();



// Check Stripe  and paypal account in db
router.get("/account/:id",  checkAcctStatus);

// ==========================================
// STRIPE ACCOUNT MANAGEMENT ROUTES
// ==========================================

// Create new Stripe account for user
router.post("/createaccount",  createStripeAccount);

// Check Stripe account status
router.get("/accountstatus/:id",  checkStripeStatus);

// Generate new onboarding link
router.get("/generatelink/:userId",  generateOnboardingLink);

// ==========================================
// ONBOARDING CALLBACK ROUTES (No token needed)
// ==========================================

// After successful onboarding
router.get("/afteronboarding", onboardingReturn);

// Link expired - regenerate
router.get("/refreshonboarding", onboardingReauth);

// ==========================================
// PAYMENT ROUTES
// ==========================================

// Create payment intent
//router.post("/createpayment",  createPayment);

// Get account balance
//router.get("/balance/:id",  getAccountBalance);

// Get available balance for payout
//router.get("/availablebalance/:id",  getAvailableBalance);

// ==========================================
// PAYOUT ROUTES
// ==========================================

// Create new payout
router.post("/createpayout",  createPayout);

// Get payout history
//router.get("/payouthistory/:id",  getPayoutHistory);

// Get single payout details
//router.get("/payoutdetails/:id/:payoutId",  getPayoutDetails);

// Cancel pending payout
//router.post("/cancelpayout/:id/:payoutId",  cancelPayout);

// ==========================================
// WEBHOOK ROUTE (No token needed)
// ==========================================
//router.post("/webhook", express.raw({ type: "application/json" }), stripeWebhook);


//router.delete('/account/:userId/disconnect', disconnectStripeAccount);
router.delete('/account/:userId/delete', deleteStripeAccount);
//router.post('/account/:userId/reconnect', reconnectStripeAccount);

export default router;