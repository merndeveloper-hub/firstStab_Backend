// import Joi from "joi";
// import { findOne,insertNewDocument, updateDocument } from "../../../../helpers/index.js";

// // ==========================================
// // 6. CREATE PAYOUT (Send money to user)
// // ==========================================

// const createPayoutSchema = Joi.object({
//   userId: Joi.string().required(),
//   amount: Joi.number().positive().required(),
//   currency: Joi.string().default("USD"),
//   note: Joi.string().optional()
// });

// const createPayout = async (req, res) => {
//   try {
//     await createPayoutSchema.validateAsync(req.body);

//     const { userId, amount, currency, note } = req.body;

//     const user = await findOne("user", { _id: userId });
//     if (!user || user.length === 0) {
//       return res.status(400).json({ 
//         status: 400, 
//         message: "User not found" 
//       });
//     }

//     if (!user.paypalEmail) {
//       return res.status(400).json({
//         status: 400,
//         message: "User has no PayPal account connected"
//       });
//     }

//     // Check if user has sufficient balance
//     const currentBalance = user.currentBalance || 0;
    
//     if (amount > currentBalance) {
//       return res.status(400).json({
//         status: 400,
//         message: `Insufficient balance. Current balance: ${currentBalance}, Requested amount: ${amount}`
//       });
//     }

//     // Create payout using REST API
//     const payoutBatch = {
//       sender_batch_header: {
//         sender_batch_id: `payout_${Date.now()}_${userId}`,
//         email_subject: "You have a payout!",
//         email_message: note || "You have received a payout. Thanks for using our service!"
//       },
//       items: [{
//         recipient_type: "EMAIL",
//         amount: {
//           value: amount.toFixed(2),
//           currency: currency
//         },
//         note: note || "Payout from platform",
//         sender_item_id: `item_${Date.now()}`,
//         receiver: user.paypalEmail,
//       }]
//     };

//     // Use fetch for PayPal REST API
//     const auth = Buffer.from(
//       `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`
//     ).toString('base64');

//     const baseURL = process.env.NODE_ENV === "production" 
//       ? "https://api-m.paypal.com"
//       : "https://api-m.sandbox.paypal.com";

//     const response = await fetch(`${baseURL}/v1/payments/payouts`, {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//         'Authorization': `Basic ${auth}`
//       },
//       body: JSON.stringify(payoutBatch)
//     });
// console.log(response,"response");
//     const result = await response.json();
// console.log(result,"result");

//     if (!response.ok) {
//       throw new Error(result.message || "Payout failed");
//     }

//     // Deduct amount from user's current balance after successful payout
//     const newBalance = currentBalance - amount;
//     await updateDocument("user", 
//       { _id: userId }, 
//       { currentBalance: newBalance }
//     );

//     // Mark user as verified after first successful payout
//     if (!user.paypalVerified) {
//       await updateDocument("user", 
//         { _id: userId }, 
//         { paypalVerified: true }
//       );
//     }


//     // Save payout record in database
//     const payoutRecord = {
//      // userId: userId,
//       professsionalId: userId, // Professional jo payout receive kar raha hai
//       amount: amount,
//       currency: currency,
//       type: "payout", // Type to distinguish from regular payments
//       paymentMethod: "PayPal",
//       sender: "Admin", // Admin account se payout
//       reciever: user.paypalEmail,
//       status: result.batch_header.batch_status, // e.g., "PENDING", "SUCCESS"
//       payout_batch_id: result.batch_header.payout_batch_id,
//       batch_status: result.batch_header.batch_status,
      
//       // PayPal payer details (in this case, it's the recipient)
//       payer: {
//         payerEmail: user.paypalEmail,
//         payerFirstName: user.firstName || "",
//         payerLastName: user.lastName || "",
//       },
      
//       // Store the sender batch ID for reference
//       purchaseUnitReference: `payout_${Date.now()}_${userId}`,
      
//       // Store any additional info
//       holdingName: note || "Platform Payout",
      
//       // Links from PayPal response
//       paypalLink: result.links && result.links.length > 0 ? result.links[0].href : "",
//     };

//     // Create payment record in database
//     const savedPayout = await insertNewDocument("userPayment", payoutRecord);

//     return res.status(200).json({
//       status: 200,
//       message: "Payout created successfully",
//       data: {
//         batchId: result.batch_header.payout_batch_id,
//         batchStatus: result.batch_header.batch_status,
//         amount: amount,
//         currency: currency,
//         paypalEmail: user.paypalEmail,
//         previousBalance: currentBalance,
//         newBalance: newBalance,
//         note: "Payout will be processed within 24 hours"
//       }
//     });

//   } catch (e) {
//     console.log(e);
//     return res.status(400).json({ 
//       status: 400, 
//       message: e.message 
//     });
//   }
// };

// export default createPayout;



import Joi from "joi";
import { findOne, insertNewDocument, updateDocument } from "../../../../helpers/index.js";

// ==========================================
// 6. CREATE PAYOUT (Send money to user)
// ==========================================

const createPayoutSchema = Joi.object({
  userId: Joi.string().required(),
  amount: Joi.number().positive().min(1).max(10000).required()
    .messages({
      'number.min': 'Minimum payout amount is $1',
      'number.max': 'Maximum payout amount is $10,000 per transaction'
    }),
  currency: Joi.string().valid('USD', 'EUR', 'GBP', 'PKR').default("USD"),
  note: Joi.string().max(200).optional()
});

// Email validation helper
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const createPayout = async (req, res) => {
  try {
    // Validate request body
    await createPayoutSchema.validateAsync(req.body);

    const { userId, amount, currency, note } = req.body;

    // Find user
    const user = await findOne("user", { _id: userId });
    if (!user || user.length === 0) {
      return res.status(404).json({ 
        status: 404, 
        message: "User not found" 
      });
    }

    // Check if PayPal email exists
    if (!user.paypalEmail) {
      return res.status(400).json({
        status: 400,
        message: "User has no PayPal account connected. Please add PayPal email first."
      });
    }

    // Validate PayPal email format
    if (!isValidEmail(user.paypalEmail)) {
      return res.status(400).json({
        status: 400,
        message: "Invalid PayPal email format. Please update with a valid email."
      });
    }

    // Check if user account is active/verified
    if (user.accountStatus === 'suspended' || user.accountStatus === 'blocked') {
      return res.status(403).json({
        status: 403,
        message: "Cannot process payout. User account is not active."
      });
    }

    // Check if user has sufficient balance
    const currentBalance = user.currentBalance || 0;
    
    if (currentBalance <= 0) {
      return res.status(400).json({
        status: 400,
        message: "No balance available for payout"
      });
    }

    if (amount > currentBalance) {
      return res.status(400).json({
        status: 400,
        message: `Insufficient balance. Available: $${currentBalance.toFixed(2)}, Requested: $${amount.toFixed(2)}`
      });
    }

    // Check for minimum payout threshold (example: $10)
    const MIN_PAYOUT = 10;
    if (amount < MIN_PAYOUT) {
      return res.status(400).json({
        status: 400,
        message: `Minimum payout amount is $${MIN_PAYOUT}`
      });
    }

    // Check for pending payouts (optional - prevent multiple pending payouts)
    const pendingPayout = await findOne("userPayment", {
      professsionalId: userId,
      type: "payout",
      batch_status: { $in: ["PENDING", "PROCESSING"] }
    });

    if (pendingPayout && pendingPayout.length > 0) {
      return res.status(400).json({
        status: 400,
        message: "You have a pending payout. Please wait for it to complete before requesting another."
      });
    }

    // Generate unique IDs
    const sender_batch_id = `payout_${Date.now()}_${userId}`;
    const sender_item_id = `item_${Date.now()}`;

    // Create payout batch
    const payoutBatch = {
      sender_batch_header: {
        sender_batch_id: sender_batch_id,
        email_subject: "You have a payout!",
        email_message: note || "You have received a payout. Thanks for using our service!"
      },
      items: [{
        recipient_type: "EMAIL",
        amount: {
          value: amount.toFixed(2),
          currency: currency
        },
        note: note || "Payout from platform",
        sender_item_id: sender_item_id,
        receiver: user.paypalEmail,
      }]
    };

    // PayPal API configuration
    const auth = Buffer.from(
      `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`
    ).toString('base64');

    const baseURL = process.env.NODE_ENV === "production" 
      ? "https://api-m.paypal.com"
      : "https://api-m.sandbox.paypal.com";

    // Make PayPal API request
    const response = await fetch(`${baseURL}/v1/payments/payouts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${auth}`
      },
      body: JSON.stringify(payoutBatch)
    });

    console.log(response, "response");
    const result = await response.json();
    console.log(result, "result");

    // Handle PayPal API errors
    if (!response.ok) {
      // Log detailed error for debugging
      console.error("PayPal Payout Error:", result);
      
      // Check for specific PayPal errors
      if (result.name === "INSUFFICIENT_FUNDS") {
        return res.status(400).json({
          status: 400,
          message: "PayPal account has insufficient funds. Please contact support."
        });
      }

      if (result.name === "RECEIVER_UNCONFIRMED") {
        return res.status(400).json({
          status: 400,
          message: "Recipient's PayPal account is not confirmed. Please verify your PayPal email."
        });
      }

      if (result.name === "INVALID_RECEIVER") {
        return res.status(400).json({
          status: 400,
          message: "Invalid PayPal email address. Please update your PayPal email."
        });
      }

      throw new Error(result.message || result.error_description || "Payout failed");
    }

    // Deduct amount from user's current balance after successful payout
    const newBalance = currentBalance - amount;
    await updateDocument("user", 
      { _id: userId }, 
      { currentBalance: newBalance }
    );

    // Mark user as verified after first successful payout
    if (!user.paypalVerified) {
      await updateDocument("user", 
        { _id: userId }, 
        { paypalVerified: true }
      );
    }

    // Save payout record in database
    const payoutRecord = {
      professsionalId: userId,
      amount: amount,
      currency: currency,
      type: "payout",
      paymentMethod: "PayPal",
      sender: "Admin",
      reciever: user.paypalEmail,
      status: result.batch_header.batch_status,
      payout_batch_id: result.batch_header.payout_batch_id,
      batch_status: result.batch_header.batch_status,
      
      payer: {
        payerEmail: user.paypalEmail,
        payerFirstName: user.firstName || "",
        payerLastName: user.lastName || "",
      },
      
      purchaseUnitReference: sender_batch_id,
      holdingName: note || "Platform Payout",
      paypalLink: result.links && result.links.length > 0 ? result.links[0].href : "",
    };

    // Create payment record in database
    const savedPayout = await insertNewDocument("userPayment", payoutRecord);

    return res.status(200).json({
      status: 200,
      message: "Payout created successfully",
      data: {
        payoutId: savedPayout._id,
        batchId: result.batch_header.payout_batch_id,
        batchStatus: result.batch_header.batch_status,
        amount: amount,
        currency: currency,
        paypalEmail: user.paypalEmail,
        previousBalance: currentBalance,
        newBalance: newBalance,
        estimatedArrival: "1-2 business days",
        note: "Payout will be processed within 24 hours"
      }
    });

  } catch (e) {
    console.error("Payout Error:", e);
    
    // Handle different types of errors
    if (e.isJoi) {
      return res.status(400).json({ 
        status: 400, 
        message: e.details[0].message 
      });
    }

    if (e.name === 'MongoError' || e.name === 'MongoServerError') {
      return res.status(500).json({
        status: 500,
        message: "Database error occurred. Please try again."
      });
    }

    return res.status(400).json({ 
      status: 400, 
      message: e.message || "An error occurred while processing payout"
    });
  }
};

export default createPayout;