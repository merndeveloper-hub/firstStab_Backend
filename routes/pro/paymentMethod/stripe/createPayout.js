// import Stripe from "stripe";
// import Joi from "joi";
// import {
//   findOne,
//   insertNewDocument,
//   updateDocument,
// } from "../../../../helpers/index.js";

// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// // ==========================================
// // Transfer from Admin Stripe to User Stripe
// // ==========================================

// const createTransferSchema = Joi.object({
//   userId: Joi.string().required(),
//   amount: Joi.number().positive().required(),
//   currency: Joi.string().default("usd"),
//   description: Joi.string().optional(),
//   serviceId: Joi.string().optional(),
// });

// const createPayout = async (req, res) => {
//   try {
//     await createTransferSchema.validateAsync(req.body);

//     const { userId, amount, currency, description, serviceId } = req.body;

//     // User ko find karo
//     const user = await findOne("user", { _id: userId });
//     if (!user || user.length === 0) {
//       return res.status(400).json({
//         status: 400,
//         message: "User not found",
//       });
//     }

//     // Check karo ke user ka Stripe Connected Account hai
//     if (!user.stripeAccountId) {
//       return res.status(400).json({
//         status: 400,
//         message:
//           "User has no Stripe Connected Account. User needs to complete onboarding first.",
//       });
//     }

//     // Optional: Check karo ke user ka onboarding complete hai
//     if (!user.onboardingCompleteStripe) {
//       return res.status(400).json({
//         status: 400,
//         message: "User needs to complete Stripe onboarding first",
//       });
//     }

//     // IMPORTANT: Check karo ke currentBalance se zyada request toh nahi kar raha
//     if (amount > user.currentBalance) {
//       return res.status(400).json({
//         status: 400,
//         message: "Requested amount exceeds current balance",
//         data: {
//           requested: amount,
//           available: user.currentBalance,
//           currency: currency,
//         },
//       });
//     }

//     // Admin ke balance ko check karo
//     const platformBalance = await stripe.balance.retrieve();
//     const availableAmount =
//       platformBalance.available.find((b) => b.currency === currency)?.amount ||
//       0;

//     if (availableAmount < amount * 100) {
//       return res.status(400).json({
//         status: 400,
//         message: "Insufficient platform balance",
//         data: {
//           requested: amount,
//           available: availableAmount / 100,
//           currency: currency,
//         },
//       });
//     }

//     // Transfer create karo from platform to user
//     const transfer = await stripe.transfers.create({
//       amount: amount * 100,
//       currency: currency,
//       destination: user.stripeAccountId,
//       description: description || `Payment for service ${serviceId || ""}`,
//       metadata: {
//         userId: userId,
//         serviceId: serviceId || "",
//         timestamp: new Date().toISOString(),
//       },
//     });

//     // ==========================================
//     // USER FIELDS UPDATE KARO
//     // ==========================================

//     // Current balance se amount minus karo (kyunki ab admin ne pay kar diya)
//     const updatedBalance = user.currentBalance - amount;

//     // User document update karo
//     const updateResult = await updateDocument(
//       "user",
//       { _id: userId },
//       {
//         currentBalance: updatedBalance < 0 ? 0 : updatedBalance, // Negative na ho
//         updatedAt: new Date(),
//       }
//     );

//     paymentUpdateResult = await insertNewDocument(
//       "userPayment",

//       {
//         paymentMethod: "Paypal",
//         sender: "Admin",
//         reciever: "Pro",
//         status: "Paid", // Pending -> Paid
//         payout_batch_id: transfer.id, // Stripe transfer ID save karo
//         batch_status: "Success", // Pending -> Success
//         updatedAt: new Date(),
//       }
//     );

//     if (!updateResult) {
//       // Agar update fail ho toh warning do (but transfer successful hai)
//       console.error("Failed to update user balance after transfer");
//     }

//     return res.status(200).json({
//       status: 200,
//       message: "Transfer completed successfully",
//       data: {
//         transferId: transfer.id,
//         amount: transfer.amount / 100,
//         currency: transfer.currency,
//         destination: transfer.destination,
//         status: "completed",
//         created: new Date(transfer.created * 1000).toISOString(),
//         userBalance: {
//           previousBalance: user.currentBalance,
//           paidAmount: amount,
//           remainingBalance: updatedBalance < 0 ? 0 : updatedBalance,
//         },
//       },
//     });
//   } catch (e) {
//     console.error("Transfer Error:", e);

//     if (e.type === "StripeInvalidRequestError") {
//       return res.status(400).json({
//         status: 400,
//         message: "Invalid transfer request",
//         error: e.message,
//       });
//     }

//     if (e.type === "StripeConnectionError") {
//       return res.status(500).json({
//         status: 500,
//         message: "Connection error with Stripe",
//       });
//     }

//     return res.status(400).json({
//       status: 400,
//       message: e.message,
//     });
//   }
// };

// export default createPayout;



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
  amount: Joi.number().positive().min(1).max(10000).required()
    .messages({
      'number.min': 'Minimum payout amount is $1',
      'number.max': 'Maximum payout amount is $10,000 per transaction'
    }),
  currency: Joi.string().valid('usd','USD', 'eur', 'gbp', 'pkr').default("usd"),
  description: Joi.string().max(200).optional(),
  note: Joi.string().max(200).optional(),
  serviceId: Joi.string().optional(),
});

const createPayout = async (req, res) => {
  try {
    // Validate request body
    await createTransferSchema.validateAsync(req.body);

    const { userId, amount, currency, description, serviceId } = req.body;

    // Find user
    const user = await findOne("user", { _id: userId });
    if (!user || user.length === 0) {
      return res.status(404).json({
        status: 404,
        message: "User not found",
      });
    }

    // Check if user has Stripe Connected Account
    if (!user.stripeAccountId) {
      return res.status(400).json({
        status: 400,
        message: "User has no Stripe Connected Account. User needs to complete onboarding first.",
      });
    }

    // Check if onboarding is complete
    if (!user.onboardingCompleteStripe) {
      return res.status(400).json({
        status: 400,
        message: "User needs to complete Stripe onboarding first",
      });
    }

    // Check if user account is active
    if (user.accountStatus === 'suspended' || user.accountStatus === 'blocked') {
      return res.status(403).json({
        status: 403,
        message: "Cannot process payout. User account is not active.",
      });
    }

    // Get current balance
    const currentBalance = user.currentBalance || 0;

    // Check if user has sufficient balance
    if (currentBalance <= 0) {
      return res.status(400).json({
        status: 400,
        message: "No balance available for payout",
      });
    }

    if (amount > currentBalance) {
      return res.status(400).json({
        status: 400,
        message: `Insufficient balance. Available: $${currentBalance.toFixed(2)}, Requested: $${amount.toFixed(2)}`,
        data: {
          requested: amount,
          available: currentBalance,
          currency: currency,
        },
      });
    }

    // Check minimum payout threshold
    const MIN_PAYOUT = 10;
    if (amount < MIN_PAYOUT) {
      return res.status(400).json({
        status: 400,
        message: `Minimum payout amount is $${MIN_PAYOUT}`,
      });
    }

    // Check for pending payouts
    const pendingPayout = await findOne("userPayment", {
      professsionalId: userId,
      type: "payout",
      paymentMethod: "Stripe",
      batch_status: { $in: ["Pending", "Processing"] }
    });

    if (pendingPayout && pendingPayout.length > 0) {
      return res.status(400).json({
        status: 400,
        message: "You have a pending payout. Please wait for it to complete before requesting another.",
      });
    }

    // Check platform balance
    let platformBalance;
    try {
      platformBalance = await stripe.balance.retrieve();
    } catch (stripeError) {
      console.error("Stripe Balance Retrieve Error:", stripeError);
      return res.status(500).json({
        status: 500,
        message: "Failed to check platform balance",
      });
    }

    const availableAmount =
      platformBalance.available.find((b) => b.currency === currency)?.amount || 0;

    if (availableAmount < amount * 100) {
      return res.status(400).json({
        status: 400,
        message: "Insufficient platform balance. Please contact support.",
        data: {
          requested: amount,
          available: availableAmount / 100,
          currency: currency,
        },
      });
    }

    // Verify Stripe Connected Account status
    let connectedAccount;
    try {
      connectedAccount = await stripe.accounts.retrieve(user.stripeAccountId);
      
      if (!connectedAccount.charges_enabled) {
        return res.status(400).json({
          status: 400,
          message: "User's Stripe account is not enabled for transfers. Please complete verification.",
        });
      }

      if (!connectedAccount.payouts_enabled) {
        return res.status(400).json({
          status: 400,
          message: "User's Stripe account cannot receive payouts. Please complete verification.",
        });
      }
    } catch (accountError) {
      console.error("Stripe Account Retrieve Error:", accountError);
      return res.status(400).json({
        status: 400,
        message: "Invalid Stripe Connected Account",
      });
    }

    // Create transfer from platform to user
    let transfer;
    try {
      transfer = await stripe.transfers.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency: currency.toLowerCase(),
        destination: user.stripeAccountId,
        description: description || `Payout for service ${serviceId || ""}`,
        metadata: {
          userId: userId,
          serviceId: serviceId || "",
          timestamp: new Date().toISOString(),
          type: "payout",
        },
      });
    } catch (transferError) {
      console.error("Stripe Transfer Error:", transferError);

      // Save failed payout attempt
      await insertNewDocument("userPayment", {
        professsionalId: userId,
        amount: amount,
        currency: currency.toUpperCase(),
        type: "payout",
        paymentMethod: "Stripe",
        sender: "Admin",
        reciever: user.email || user.stripeAccountId,
        status: "Failed",
        batch_status: "Failed",
        holdingName: description || "Platform Payout - Failed",
        transactionId: `failed_${Date.now()}`,
        paypalLink: JSON.stringify(transferError.message),
      });

      return res.status(400).json({
        status: 400,
        message: transferError.message || "Transfer failed",
        error: transferError.type,
      });
    }

    // Update user balance after successful transfer
    const updatedBalance = currentBalance - amount;
    await updateDocument(
      "user",
      { _id: userId },
      {
        currentBalance: updatedBalance < 0 ? 0 : updatedBalance,
        updatedAt: new Date(),
      }
    );

    // Mark user as verified if first successful payout
    if (!user.stripePayoutVerified) {
      await updateDocument(
        "user",
        { _id: userId },
        { stripePayoutVerified: true }
      );
    }

    // Save payout record in database
    const payoutRecord = {
      professsionalId: userId,
      amount: amount,
      currency: currency.toUpperCase(),
      type: "payout",
      paymentMethod: "Stripe",
      sender: "Admin",
      reciever: user.email || user.stripeAccountId,
      status: "Paid",
      
      // Stripe-specific fields
      transactionId: transfer.id,
      paymentIntentId: transfer.id,
      stripeSessionId: transfer.id,
      
      // Payout batch tracking
      payout_batch_id: transfer.id,
      batch_status: "Success",
      
      // Additional details
      holdingName: description || "Platform Payout",
      purchaseUnitReference: `stripe_transfer_${Date.now()}`,
      
      // Store transfer details
      paypalLink: JSON.stringify({
        transferId: transfer.id,
        destination: transfer.destination,
        created: transfer.created,
        livemode: transfer.livemode,
      }),
      
      // Payer information (recipient in this case)
      payer: {
        payerEmail: user.email || "",
        payerFirstName: user.firstName || "",
        payerLastName: user.lastName || "",
      },
    };

    const savedPayout = await insertNewDocument("userPayment", payoutRecord);

    return res.status(200).json({
      status: 200,
      message: "Payout completed successfully",
      data: {
        payoutId: savedPayout._id,
        transferId: transfer.id,
        amount: transfer.amount / 100,
        currency: transfer.currency.toUpperCase(),
        destination: transfer.destination,
        status: "completed",
        created: new Date(transfer.created * 1000).toISOString(),
        userBalance: {
          previousBalance: currentBalance,
          paidAmount: amount,
          remainingBalance: updatedBalance < 0 ? 0 : updatedBalance,
        },
        estimatedArrival: "Instant for Stripe accounts",
        accountVerified: connectedAccount.charges_enabled && connectedAccount.payouts_enabled,
      },
    });

  } catch (e) {
    console.error("Payout Error:", e);

    // Handle Joi validation errors
    if (e.isJoi) {
      return res.status(400).json({
        status: 400,
        message: e.details[0].message,
      });
    }

    // Handle Stripe-specific errors
    if (e.type === "StripeInvalidRequestError") {
      return res.status(400).json({
        status: 400,
        message: "Invalid payout request",
        error: e.message,
      });
    }

    if (e.type === "StripeConnectionError") {
      return res.status(500).json({
        status: 500,
        message: "Connection error with Stripe. Please try again.",
      });
    }

    if (e.type === "StripeAuthenticationError") {
      return res.status(500).json({
        status: 500,
        message: "Stripe authentication failed. Please contact support.",
      });
    }

    if (e.type === "StripeAPIError") {
      return res.status(500).json({
        status: 500,
        message: "Stripe API error. Please try again later.",
      });
    }

    // Handle database errors
    if (e.name === 'MongoError' || e.name === 'MongoServerError') {
      return res.status(500).json({
        status: 500,
        message: "Database error occurred. Please try again.",
      });
    }

    return res.status(400).json({
      status: 400,
      message: e.message || "An error occurred while processing payout",
    });
  }
};

export default createPayout;