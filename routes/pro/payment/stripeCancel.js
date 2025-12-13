import Stripe from "stripe";
import { updateDocument } from "../../../helpers/index.js";
import send_email from "../../../lib/node-mailer/index.js";


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

const findPayment = await findOne("payment", {
      stripeSessionId: session.id,
    });

const findPro = await findOne("user", {
      _id: findPayment?.professionalId,
    });


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

     // PayPal Cancel ya Stripe Cancel route mein

await send_email(
  "proRegisterationPaymentFailed",
  {
    user: findPro?.first_Name || findPro?.email,
    paymentMethod: findPayment?.paymentMethod, // "PayPal" or "Stripe"
  },
  process.env.SENDER_EMAIL,
  "Payment Failed - Please Try Again",
  findPro?.email
);

    return res.send("<html><body style='background:#fff;'></body></html>");
  } catch (error) {
    return res.status(400).json({ status: 400, message: error.message });
  }
};

export default stripeCancel;
