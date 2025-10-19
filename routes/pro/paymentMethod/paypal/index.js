// routes/paypal/index.js

import express from "express";
// import {
//   connectPayPalAccount,
//   checkPayPalStatus,
//   updatePayPalEmail,
//   createPaymentOrder,
//   capturePayment,
//   createPayout,
//   getPayoutStatus,
//   paymentSuccess,
//   paymentCancel,
//   disconnectPayPalAccount
// } from "../../controllers/paypal/paypalController.js";

// Import your token verification middleware
import connectPayPalAccount from "./AddPaypal.js";
import checkPayPalStatus from "./checkPayPalStatus.js";
import updatePayPalEmail from "./updatePaypalEmail.js";
import createPayout from "./createPayout.js";
import disconnectPayPalAccount from "./disconnect.js";

const router = express.Router();

// ==========================================
// PAYPAL ACCOUNT MANAGEMENT ROUTES
// ==========================================

// Connect PayPal account
router.post("/connectaccount",  connectPayPalAccount);

// Check PayPal account status
router.get("/accountstatus/:id",  checkPayPalStatus);

// Update PayPal email
router.put("/updateemail",  updatePayPalEmail);

// Disconnect PayPal account
router.post("/disconnect/:userId",  disconnectPayPalAccount);

// ==========================================
// PAYMENT ROUTES
// ==========================================

// Create payment order
//router.post("/createorder",  createPaymentOrder);

// Capture payment
//router.post("/capturepayment",  capturePayment);

// ==========================================
// PAYOUT ROUTES
// ==========================================

// Create payout
router.post("/createpayout",  createPayout);

// Get payout status
//router.get("/payoutstatus/:batchId",  getPayoutStatus);

// ==========================================
// CALLBACK ROUTES (No token needed)
// ==========================================

// Payment success
//router.get("/payment-success", paymentSuccess);

// Payment cancel
//router.get("/payment-cancel", paymentCancel);

export default router;