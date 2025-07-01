import Stripe from "stripe";
import { updateDocument } from "../../../helpers/index.js";

let stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const stripeCancel = async (req, res) => {
  try {
    const { session_id } = req.query;

    const session = await stripe.checkout.sessions.retrieve(session_id);

    if (!session_id) {
      return res
        .status(400)
        .json({ status: 400, message: "Missing session_id" });
    }

    const deleted = await updateDocument(
      "payment",
      {
        stripeSessionId: session.id,
      },
      {
        amount: session.amount_total,
        currency: session.currency,
        paymentMethod: "Stripe",
        stripeSessionId: session.id,
        status: "Canceled",
        sender: session.customer_details?.email || null,
      }
    );

    return res.send("<html><body style='background:#fff;'></body></html>");
  } catch (error) {
    return res.status(400).json({ status: 400, message: error.message });
  }
};

export default stripeCancel;
