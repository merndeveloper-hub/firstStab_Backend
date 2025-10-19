// ==========================================
// SETUP: Install packages
// npm install stripe joi
// ==========================================

import Stripe from "stripe";
import Joi from "joi";
import { findOne, insertOne, updateOne } from "../../../helpers/index.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// ==========================================
// 1. CREATE STRIPE ACCOUNT   --->done
// ==========================================

const createStripeAccountSchema = Joi.object({
  email: Joi.string().email().required(),
  firstName: Joi.string().required(),
  lastName: Joi.string().required(),
  phone: Joi.string().required(),
  country: Joi.string().default("US"),
  userId: Joi.string().required()
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
        message: "User not found" 
      });
    }

    // Check if user already has Stripe account
    if (user.stripeAccountId) {
      return res.status(400).json({
        status: 400,
        message: "User already has a Stripe account",
        data: { stripeAccountId: user.stripeAccountId }
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
        phone: phone
      }
    });

    // Update user with Stripe account ID
    await updateOne("user", 
      { _id: userId }, 
      { 
        stripeAccountId: account.id,
        stripeAccountStatus: "pending",
        onboardingComplete: false
      }
    );

    // Generate onboarding link
    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: `${process.env.BASE_URL}/api/stripe/reauth?userId=${userId}`,
      return_url: `${process.env.BASE_URL}/api/stripe/return?userId=${userId}`,
      type: "account_onboarding",
    });

    return res.status(200).json({
      status: 200,
      message: "Stripe account created successfully",
      data: {
        stripeAccountId: account.id,
        onboardingUrl: accountLink.url,
        instructions: "User ko is URL par redirect karein to complete onboarding"
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

// ==========================================
// 2. CHECK STRIPE ACCOUNT STATUS  --->done
// ==========================================

const checkStripeStatusSchema = Joi.object({
  userId: Joi.string().required()
});

const checkStripeStatus = async (req, res) => {
  try {
    await checkStripeStatusSchema.validateAsync(req.params);

    const { userId } = req.params;

    const user = await findOne("user", { _id: userId });
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
    await updateOne("user", 
      { _id: userId }, 
      {
        stripeAccountStatus: account.charges_enabled ? "active" : "restricted",
        onboardingComplete: account.details_submitted
      }
    );

    return res.status(200).json({
      status: 200,
      message: "Stripe account status retrieved",
      data: {
        hasAccount: true,
        accountId: user.stripeAccountId,
        status: account.charges_enabled ? "active" : "restricted",
        onboardingComplete: account.details_submitted,
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
      refresh_url: `${process.env.BASE_URL}/api/stripe/reauth?userId=${userId}`,
      return_url: `${process.env.BASE_URL}/api/stripe/return?userId=${userId}`,
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

// ==========================================
// 4. ONBOARDING RETURN CALLBACK  --->done
// ==========================================

const onboardingReturn = async (req, res) => {
  try {
    const { userId } = req.query;

    if (userId) {
      // Update user status
      const user = await findOne("user", { _id: userId });
      if (user && user.stripeAccountId) {
        const account = await stripe.accounts.retrieve(user.stripeAccountId);
        
        await updateOne("user", 
          { _id: userId }, 
          {
            stripeAccountStatus: account.charges_enabled ? "active" : "restricted",
            onboardingComplete: account.details_submitted
          }
        );
      }
    }

    return res.send(`
      <html>
        <head>
          <style>
            body { font-family: Arial; text-align: center; padding: 50px; }
            .success { color: #28a745; }
          </style>
        </head>
        <body>
          <h2 class="success">✅ Onboarding Complete!</h2>
          <p>Aapka Stripe account successfully setup ho gaya hai.</p>
          <p>Redirecting...</p>
          <script>
            setTimeout(() => {
              window.location.href = '${process.env.FRONTEND_URL}/dashboard';
            }, 2000);
          </script>
        </body>
      </html>
    `);

  } catch (e) {
    console.log(e);
    return res.status(400).send("Error completing onboarding");
  }
};

// ==========================================
// 5. ONBOARDING REFRESH CALLBACK  --->done
// ==========================================

const onboardingReauth = async (req, res) => {
  try {
    const { userId } = req.query;

    return res.send(`
      <html>
        <head>
          <style>
            body { font-family: Arial; text-align: center; padding: 50px; }
            .warning { color: #ffc107; }
          </style>
        </head>
        <body>
          <h2 class="warning">⚠️ Link Expired</h2>
          <p>Onboarding link expire ho gaya hai.</p>
          <p>Redirecting to generate new link...</p>
          <script>
            setTimeout(() => {
              window.location.href = '${process.env.FRONTEND_URL}/complete-profile?userId=${userId}';
            }, 2000);
          </script>
        </body>
      </html>
    `);

  } catch (e) {
    console.log(e);
    return res.status(400).send("Error refreshing onboarding");
  }
};

// ==========================================
// 6. CREATE PAYMENT INTENT
// ==========================================

const createPaymentSchema = Joi.object({
  userId: Joi.string().required(),
  amount: Joi.number().positive().required(),
  currency: Joi.string().default("usd"),
  description: Joi.string().required(),
  platformFeePercent: Joi.number().min(0).max(100).default(10)
});

const createPayment = async (req, res) => {
  try {
    await createPaymentSchema.validateAsync(req.body);

    const { userId, amount, currency, description, platformFeePercent } = req.body;

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
        message: "User has no Stripe account"
      });
    }

    if (!user.onboardingComplete) {
      return res.status(400).json({
        status: 400,
        message: "User needs to complete onboarding first",
        needsOnboarding: true
      });
    }

    // Calculate platform fee
    const platformFee = Math.round(amount * 100 * (platformFeePercent / 100));

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100, // Convert to cents
      currency: currency,
      description: description,
      transfer_data: {
        destination: user.stripeAccountId,
      },
      application_fee_amount: platformFee,
    });

    return res.status(200).json({
      status: 200,
      message: "Payment intent created",
      data: {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        amount: amount,
        platformFee: platformFee / 100,
        userReceives: (amount * 100 - platformFee) / 100
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

// ==========================================
// 7. GET ACCOUNT BALANCE
// ==========================================

const getBalanceSchema = Joi.object({
  userId: Joi.string().required()
});

const getAccountBalance = async (req, res) => {
  try {
    await getBalanceSchema.validateAsync(req.params);

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
        message: "User has no Stripe account"
      });
    }

    // Get balance from Stripe
    const balance = await stripe.balance.retrieve({
      stripeAccount: user.stripeAccountId,
    });

    return res.status(200).json({
      status: 200,
      message: "Balance retrieved",
      data: {
        available: balance.available,
        pending: balance.pending,
        currency: balance.available[0]?.currency || "usd"
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

// ==========================================
// 8. WEBHOOK HANDLER
// ==========================================

const stripeWebhook = async (req, res) => {
  try {
    const sig = req.headers["stripe-signature"];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event;
    try {
      event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } catch (err) {
      console.log("Webhook signature verification failed:", err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle different event types
    switch (event.type) {
      case "account.updated":
        const account = event.data.object;
        await updateOne("user",
          { stripeAccountId: account.id },
          {
            stripeAccountStatus: account.charges_enabled ? "active" : "restricted",
            onboardingComplete: account.details_submitted
          }
        );
        break;

      case "payment_intent.succeeded":
        const paymentIntent = event.data.object;
        console.log("Payment succeeded:", paymentIntent.id);
        // Add your logic here
        break;

      case "payment_intent.payment_failed":
        const failedPayment = event.data.object;
        console.log("Payment failed:", failedPayment.id);
        // Add your logic here
        break;

      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    return res.status(200).json({ received: true });

  } catch (e) {
    console.log(e);
    return res.status(400).json({ 
      status: 400, 
      message: e.message 
    });
  }
};

// ==========================================
// 9. CREATE PAYOUT (Transfer to User Bank)   --> done
// ==========================================

const createPayoutSchema = Joi.object({
  userId: Joi.string().required(),
  amount: Joi.number().positive().required(),
  currency: Joi.string().default("usd"),
  description: Joi.string().optional()
});

const createPayout = async (req, res) => {
  try {
    await createPayoutSchema.validateAsync(req.body);

    const { userId, amount, currency, description } = req.body;

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
        message: "User has no Stripe account"
      });
    }

    if (!user.onboardingComplete) {
      return res.status(400).json({
        status: 400,
        message: "User needs to complete onboarding first"
      });
    }

    // Check account balance first
    const balance = await stripe.balance.retrieve({
      stripeAccount: user.stripeAccountId,
    });

    const availableAmount = balance.available.find(b => b.currency === currency)?.amount || 0;

    if (availableAmount < amount * 100) {
      return res.status(400).json({
        status: 400,
        message: "Insufficient balance",
        data: {
          requested: amount,
          available: availableAmount / 100,
          currency: currency
        }
      });
    }

    // Create payout
    const payout = await stripe.payouts.create({
      amount: amount * 100,
      currency: currency,
      description: description || "Payout to bank account",
    }, {
      stripeAccount: user.stripeAccountId,
    });

    return res.status(200).json({
      status: 200,
      message: "Payout created successfully",
      data: {
        payoutId: payout.id,
        amount: payout.amount / 100,
        currency: payout.currency,
        status: payout.status,
        arrivalDate: payout.arrival_date,
        estimatedArrival: new Date(payout.arrival_date * 1000).toLocaleDateString()
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

// ==========================================
// 10. GET PAYOUT HISTORY
// ==========================================

const getPayoutHistorySchema = Joi.object({
  userId: Joi.string().required(),
  limit: Joi.number().min(1).max(100).default(10)
});

const getPayoutHistory = async (req, res) => {
  try {
    await getPayoutHistorySchema.validateAsync({
      userId: req.params.userId,
      limit: req.query.limit
    });

    const { userId } = req.params;
    const { limit } = req.query;

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
        message: "User has no Stripe account"
      });
    }

    // Get payout history
    const payouts = await stripe.payouts.list({
      limit: parseInt(limit) || 10,
    }, {
      stripeAccount: user.stripeAccountId,
    });

    const formattedPayouts = payouts.data.map(payout => ({
      payoutId: payout.id,
      amount: payout.amount / 100,
      currency: payout.currency,
      status: payout.status,
      description: payout.description,
      arrivalDate: new Date(payout.arrival_date * 1000).toLocaleDateString(),
      created: new Date(payout.created * 1000).toLocaleDateString(),
      method: payout.method,
      type: payout.type
    }));

    return res.status(200).json({
      status: 200,
      message: "Payout history retrieved",
      data: {
        payouts: formattedPayouts,
        hasMore: payouts.has_more,
        count: payouts.data.length
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

// ==========================================
// 11. GET SINGLE PAYOUT DETAILS
// ==========================================

const getPayoutDetailsSchema = Joi.object({
  userId: Joi.string().required(),
  payoutId: Joi.string().required()
});

const getPayoutDetails = async (req, res) => {
  try {
    await getPayoutDetailsSchema.validateAsync(req.params);

    const { userId, payoutId } = req.params;

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
        message: "User has no Stripe account"
      });
    }

    // Get payout details
    const payout = await stripe.payouts.retrieve(payoutId, {
      stripeAccount: user.stripeAccountId,
    });

    return res.status(200).json({
      status: 200,
      message: "Payout details retrieved",
      data: {
        payoutId: payout.id,
        amount: payout.amount / 100,
        currency: payout.currency,
        status: payout.status,
        description: payout.description,
        arrivalDate: new Date(payout.arrival_date * 1000).toLocaleDateString(),
        created: new Date(payout.created * 1000).toLocaleDateString(),
        method: payout.method,
        type: payout.type,
        failureCode: payout.failure_code,
        failureMessage: payout.failure_message,
        destination: payout.destination
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

// ==========================================
// 12. CANCEL PAYOUT (Only if still pending)
// ==========================================

const cancelPayoutSchema = Joi.object({
  userId: Joi.string().required(),
  payoutId: Joi.string().required()
});

const cancelPayout = async (req, res) => {
  try {
    await cancelPayoutSchema.validateAsync(req.params);

    const { userId, payoutId } = req.params;

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
        message: "User has no Stripe account"
      });
    }

    // Cancel payout
    const payout = await stripe.payouts.cancel(payoutId, {
      stripeAccount: user.stripeAccountId,
    });

    return res.status(200).json({
      status: 200,
      message: "Payout cancelled successfully",
      data: {
        payoutId: payout.id,
        status: payout.status,
        amount: payout.amount / 100,
        currency: payout.currency
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

// ==========================================
// 13. GET AVAILABLE BALANCE FOR PAYOUT
// ==========================================

const getAvailableBalanceSchema = Joi.object({
  userId: Joi.string().required()
});

const getAvailableBalance = async (req, res) => {
  try {
    await getAvailableBalanceSchema.validateAsync(req.params);

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
        message: "User has no Stripe account"
      });
    }

    // Get balance
    const balance = await stripe.balance.retrieve({
      stripeAccount: user.stripeAccountId,
    });

    const formattedBalance = {
      available: balance.available.map(b => ({
        amount: b.amount / 100,
        currency: b.currency
      })),
      pending: balance.pending.map(b => ({
        amount: b.amount / 100,
        currency: b.currency
      })),
      totalAvailable: balance.available.reduce((sum, b) => sum + (b.amount / 100), 0),
      totalPending: balance.pending.reduce((sum, b) => sum + (b.amount / 100), 0)
    };

    return res.status(200).json({
      status: 200,
      message: "Balance retrieved successfully",
      data: formattedBalance
    });

  } catch (e) {
    console.log(e);
    return res.status(400).json({ 
      status: 400, 
      message: e.message 
    });
  }
};


// ==========================================
// 14. DISCONNECT STRIPE ACCOUNT (Soft Delete)
// ==========================================

const disconnectAccountSchema = Joi.object({
  userId: Joi.string().required()
});

const disconnectStripeAccount = async (req, res) => {
  try {
    await disconnectAccountSchema.validateAsync(req.params);

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
        message: "User has no Stripe account to disconnect"
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
        message: "Cannot disconnect account with pending or available balance",
        data: {
          availableBalance: totalAvailable / 100,
          pendingBalance: totalPending / 100,
          recommendation: "Please withdraw all funds before disconnecting"
        }
      });
    }

    // Update user - soft disconnect (keeps reference)
    await updateOne("user", 
      { _id: userId }, 
      { 
        stripeAccountStatus: "disconnected",
        stripeAccountDisconnectedAt: new Date(),
        onboardingComplete: false
      }
    );

    return res.status(200).json({
      status: 200,
      message: "Stripe account disconnected successfully",
      data: {
        userId: userId,
        stripeAccountId: user.stripeAccountId,
        note: "Account reference preserved. User can reconnect anytime."
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
      await updateOne("user", 
        { _id: userId }, 
        { 
          $unset: {
            stripeAccountId: "",
            stripeAccountStatus: "",
            onboardingComplete: "",
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

// ==========================================
// 16. RECONNECT STRIPE ACCOUNT
// ==========================================

const reconnectAccountSchema = Joi.object({
  userId: Joi.string().required()
});

const reconnectStripeAccount = async (req, res) => {
  try {
    await reconnectAccountSchema.validateAsync(req.params);

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
        message: "No Stripe account found. Please create new account."
      });
    }

    if (user.stripeAccountStatus !== "disconnected") {
      return res.status(400).json({
        status: 400,
        message: "Account is not disconnected",
        data: {
          currentStatus: user.stripeAccountStatus
        }
      });
    }

    // Verify account still exists on Stripe
    try {
      const account = await stripe.accounts.retrieve(user.stripeAccountId);
      
      // Reactivate account
      await updateOne("user", 
        { _id: userId }, 
        { 
          stripeAccountStatus: account.charges_enabled ? "active" : "restricted",
          onboardingComplete: account.details_submitted,
          $unset: { stripeAccountDisconnectedAt: "" }
        }
      );

      // Generate new onboarding link if needed
      let onboardingUrl = null;
      if (!account.details_submitted) {
        const accountLink = await stripe.accountLinks.create({
          account: user.stripeAccountId,
          refresh_url: `${process.env.BASE_URL}/api/stripe/reauth?userId=${userId}`,
          return_url: `${process.env.BASE_URL}/api/stripe/return?userId=${userId}`,
          type: "account_onboarding",
        });
        onboardingUrl = accountLink.url;
      }

      return res.status(200).json({
        status: 200,
        message: "Stripe account reconnected successfully",
        data: {
          stripeAccountId: user.stripeAccountId,
          status: account.charges_enabled ? "active" : "restricted",
          onboardingComplete: account.details_submitted,
          onboardingUrl: onboardingUrl
        }
      });

    } catch (stripeError) {
      // Account doesn't exist on Stripe anymore
      await updateOne("user", 
        { _id: userId }, 
        { 
          $unset: {
            stripeAccountId: "",
            stripeAccountStatus: "",
            onboardingComplete: "",
            stripeAccountDisconnectedAt: ""
          }
        }
      );

      return res.status(400).json({
        status: 400,
        message: "Stripe account no longer exists. Please create new account.",
        data: {
          needsNewAccount: true
        }
      });
    }

  } catch (e) {
    console.log(e);
    return res.status(400).json({ 
      status: 400, 
      message: e.message 
    });
  }
};

// ==========================================
// EXPORTS
// ==========================================

export {
  createStripeAccount,
  checkStripeStatus,
  generateOnboardingLink,
  onboardingReturn,
  onboardingReauth,
  createPayment,
  getAccountBalance,
  stripeWebhook,
  createPayout,
  getPayoutHistory,
  getPayoutDetails,
  cancelPayout,
  getAvailableBalance,
  disconnectStripeAccount,
  deleteStripeAccount,
  reconnectStripeAccount
};


