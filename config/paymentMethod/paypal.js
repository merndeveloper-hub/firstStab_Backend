// ==========================================
// SETUP: Install packages
// npm install @paypal/checkout-server-sdk joi
// ==========================================

import paypal from "@paypal/checkout-server-sdk";
import Joi from "joi";
import { findOne, insertOne, updateOne } from "../../../helpers/index.js";

// ==========================================
// PAYPAL ENVIRONMENT SETUP
// ==========================================

const environment = () => {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;

  // Use Sandbox for testing, Live for production
  if (process.env.NODE_ENV === "production") {
    return new paypal.core.LiveEnvironment(clientId, clientSecret);
  } else {
    return new paypal.core.SandboxEnvironment(clientId, clientSecret);
  }
};

const client = () => new paypal.core.PayPalHttpClient(environment());

// ==========================================
// 1. CONNECT PAYPAL ACCOUNT (Save PayPal Email)  --> done
// ==========================================

const connectPayPalSchema = Joi.object({
  userId: Joi.string().required(),
  paypalEmail: Joi.string().email().required(),
  firstName: Joi.string().required(),
  lastName: Joi.string().required(),
  country: Joi.string().default("US")
});

const connectPayPalAccount = async (req, res) => {
  try {
    await connectPayPalSchema.validateAsync(req.body);

    const { userId, paypalEmail, firstName, lastName, country } = req.body;

    // Check if user exists
    const user = await findOne("user", { _id: userId });
    if (!user || user.length === 0) {
      return res.status(400).json({ 
        status: 400, 
        message: "User not found" 
      });
    }

    // Check if user already has PayPal account
    if (user.paypalEmail) {
      return res.status(400).json({
        status: 400,
        message: "User already has a PayPal account connected",
        data: { paypalEmail: user.paypalEmail }
      });
    }

    // Update user with PayPal info
    await updateOne("user", 
      { _id: userId }, 
      { 
        paypalEmail: paypalEmail,
        paypalFirstName: firstName,
        paypalLastName: lastName,
        paypalCountry: country,
        paypalConnected: true,
        paypalVerified: false // Will be verified on first payout
      }
    );

    return res.status(200).json({
      status: 200,
      message: "PayPal account connected successfully",
      data: {
        paypalEmail: paypalEmail,
        connected: true,
        note: "PayPal account will be verified on first payout"
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
// 2. CHECK PAYPAL CONNECTION STATUS  --> done
// ==========================================

const checkPayPalStatusSchema = Joi.object({
  userId: Joi.string().required()
});

const checkPayPalStatus = async (req, res) => {
  try {
    await checkPayPalStatusSchema.validateAsync(req.params);

    const { userId } = req.params;

    const user = await findOne("user", { _id: userId });
    if (!user || user.length === 0) {
      return res.status(400).json({ 
        status: 400, 
        message: "User not found" 
      });
    }

    if (!user.paypalEmail) {
      return res.status(200).json({
        status: 200,
        message: "No PayPal account connected",
        data: {
          hasAccount: false,
          needsConnection: true
        }
      });
    }

    return res.status(200).json({
      status: 200,
      message: "PayPal account status retrieved",
      data: {
        hasAccount: true,
        paypalEmail: user.paypalEmail,
        connected: user.paypalConnected || false,
        verified: user.paypalVerified || false,
        firstName: user.paypalFirstName,
        lastName: user.paypalLastName
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
// 3. UPDATE PAYPAL EMAIL   --> done
// ==========================================

const updatePayPalEmailSchema = Joi.object({
  userId: Joi.string().required(),
  paypalEmail: Joi.string().email().required()
});

const updatePayPalEmail = async (req, res) => {
  try {
    await updatePayPalEmailSchema.validateAsync(req.body);

    const { userId, paypalEmail } = req.body;

    const user = await findOne("user", { _id: userId });
    if (!user || user.length === 0) {
      return res.status(400).json({ 
        status: 400, 
        message: "User not found" 
      });
    }

    await updateOne("user", 
      { _id: userId }, 
      { 
        paypalEmail: paypalEmail,
        paypalVerified: false // Reset verification
      }
    );

    return res.status(200).json({
      status: 200,
      message: "PayPal email updated successfully",
      data: {
        paypalEmail: paypalEmail
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
// 4. CREATE PAYMENT ORDER
// ==========================================

const createPaymentOrderSchema = Joi.object({
  userId: Joi.string().required(),
  amount: Joi.number().positive().required(),
  currency: Joi.string().default("USD"),
  description: Joi.string().required()
});

const createPaymentOrder = async (req, res) => {
  try {
    await createPaymentOrderSchema.validateAsync(req.body);

    const { userId, amount, currency, description } = req.body;

    const user = await findOne("user", { _id: userId });
    if (!user || user.length === 0) {
      return res.status(400).json({ 
        status: 400, 
        message: "User not found" 
      });
    }

    // Create PayPal order
    const request = new paypal.orders.OrdersCreateRequest();
    request.prefer("return=representation");
    request.requestBody({
      intent: "CAPTURE",
      purchase_units: [{
        description: description,
        amount: {
          currency_code: currency,
          value: amount.toFixed(2)
        },
        payee: {
          email_address: user.paypalEmail || process.env.PAYPAL_MERCHANT_EMAIL
        }
      }],
      application_context: {
        brand_name: process.env.APP_NAME || "Your App",
        landing_page: "BILLING",
        user_action: "PAY_NOW",
        return_url: `${process.env.BASE_URL}/api/paypal/payment-success`,
        cancel_url: `${process.env.BASE_URL}/api/paypal/payment-cancel`
      }
    });

    const order = await client().execute(request);

    return res.status(200).json({
      status: 200,
      message: "Payment order created",
      data: {
        orderId: order.result.id,
        approvalUrl: order.result.links.find(link => link.rel === "approve").href,
        amount: amount,
        currency: currency
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
// 5. CAPTURE PAYMENT
// ==========================================

const capturePaymentSchema = Joi.object({
  orderId: Joi.string().required()
});

const capturePayment = async (req, res) => {
  try {
    await capturePaymentSchema.validateAsync(req.body);

    const { orderId } = req.body;

    const request = new paypal.orders.OrdersCaptureRequest(orderId);
    request.requestBody({});

    const capture = await client().execute(request);

    return res.status(200).json({
      status: 200,
      message: "Payment captured successfully",
      data: {
        orderId: capture.result.id,
        status: capture.result.status,
        captureId: capture.result.purchase_units[0].payments.captures[0].id,
        amount: capture.result.purchase_units[0].payments.captures[0].amount
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
// 6. CREATE PAYOUT (Send money to user)
// ==========================================

const createPayoutSchema = Joi.object({
  userId: Joi.string().required(),
  amount: Joi.number().positive().required(),
  currency: Joi.string().default("USD"),
  note: Joi.string().optional()
});

const createPayout = async (req, res) => {
  try {
    await createPayoutSchema.validateAsync(req.body);

    const { userId, amount, currency, note } = req.body;

    const user = await findOne("user", { _id: userId });
    if (!user || user.length === 0) {
      return res.status(400).json({ 
        status: 400, 
        message: "User not found" 
      });
    }

    if (!user.paypalEmail) {
      return res.status(400).json({
        status: 400,
        message: "User has no PayPal account connected"
      });
    }

    // Create payout using REST API
    const payoutBatch = {
      sender_batch_header: {
        sender_batch_id: `payout_${Date.now()}_${userId}`,
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
        sender_item_id: `item_${Date.now()}`,
        receiver: user.paypalEmail
      }]
    };

    // Use fetch for PayPal REST API
    const auth = Buffer.from(
      `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`
    ).toString('base64');

    const baseURL = process.env.NODE_ENV === "production" 
      ? "https://api-m.paypal.com"
      : "https://api-m.sandbox.paypal.com";

    const response = await fetch(`${baseURL}/v1/payments/payouts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${auth}`
      },
      body: JSON.stringify(payoutBatch)
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Payout failed");
    }

    // Mark user as verified after first successful payout
    if (!user.paypalVerified) {
      await updateOne("user", 
        { _id: userId }, 
        { paypalVerified: true }
      );
    }

    return res.status(200).json({
      status: 200,
      message: "Payout created successfully",
      data: {
        batchId: result.batch_header.payout_batch_id,
        batchStatus: result.batch_header.batch_status,
        amount: amount,
        currency: currency,
        paypalEmail: user.paypalEmail,
        note: "Payout will be processed within 24 hours"
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
// 7. GET PAYOUT STATUS
// ==========================================

const getPayoutStatusSchema = Joi.object({
  batchId: Joi.string().required()
});

const getPayoutStatus = async (req, res) => {
  try {
    await getPayoutStatusSchema.validateAsync(req.params);

    const { batchId } = req.params;

    const auth = Buffer.from(
      `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`
    ).toString('base64');

    const baseURL = process.env.NODE_ENV === "production" 
      ? "https://api-m.paypal.com"
      : "https://api-m.sandbox.paypal.com";

    const response = await fetch(`${baseURL}/v1/payments/payouts/${batchId}`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${auth}`
      }
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Failed to fetch payout status");
    }

    return res.status(200).json({
      status: 200,
      message: "Payout status retrieved",
      data: {
        batchId: result.batch_header.payout_batch_id,
        batchStatus: result.batch_header.batch_status,
        timeCreated: result.batch_header.time_created,
        amount: result.batch_header.amount,
        items: result.items
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
// 8. PAYMENT SUCCESS CALLBACK
// ==========================================

const paymentSuccess = async (req, res) => {
  try {
    const { token, PayerID } = req.query;

    return res.send(`
      <html>
        <head>
          <style>
            body { font-family: Arial; text-align: center; padding: 50px; }
            .success { color: #28a745; }
          </style>
        </head>
        <body>
          <h2 class="success">✅ Payment Successful!</h2>
          <p>Your payment has been processed successfully.</p>
          <p>Redirecting...</p>
          <script>
            setTimeout(() => {
              window.location.href = '${process.env.FRONTEND_URL}/payment-success?token=${token}';
            }, 2000);
          </script>
        </body>
      </html>
    `);

  } catch (e) {
    console.log(e);
    return res.status(400).send("Payment processing failed");
  }
};

// ==========================================
// 9. PAYMENT CANCEL CALLBACK
// ==========================================

const paymentCancel = async (req, res) => {
  try {
    return res.send(`
      <html>
        <head>
          <style>
            body { font-family: Arial; text-align: center; padding: 50px; }
            .warning { color: #ffc107; }
          </style>
        </head>
        <body>
          <h2 class="warning">⚠️ Payment Cancelled</h2>
          <p>Your payment has been cancelled.</p>
          <p>Redirecting...</p>
          <script>
            setTimeout(() => {
              window.location.href = '${process.env.FRONTEND_URL}/payment-cancel';
            }, 2000);
          </script>
        </body>
      </html>
    `);

  } catch (e) {
    console.log(e);
    return res.status(400).send("Error processing cancellation");
  }
};

// ==========================================
// 10. DISCONNECT PAYPAL ACCOUNT
// ==========================================

const disconnectPayPalSchema = Joi.object({
  userId: Joi.string().required()
});

const disconnectPayPalAccount = async (req, res) => {
  try {
    await disconnectPayPalSchema.validateAsync(req.params);

    const { userId } = req.params;

    const user = await findOne("user", { _id: userId });
    if (!user || user.length === 0) {
      return res.status(400).json({ 
        status: 400, 
        message: "User not found" 
      });
    }

    await updateOne("user", 
      { _id: userId }, 
      { 
        paypalEmail: null,
        paypalFirstName: null,
        paypalLastName: null,
        paypalCountry: null,
        paypalConnected: false,
        paypalVerified: false
      }
    );

    return res.status(200).json({
      status: 200,
      message: "PayPal account disconnected successfully"
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
// EXPORTS
// ==========================================

export {
  connectPayPalAccount,
  checkPayPalStatus,
  updatePayPalEmail,
  createPaymentOrder,
  capturePayment,
  createPayout,
  getPayoutStatus,
  paymentSuccess,
  paymentCancel,
  disconnectPayPalAccount
};