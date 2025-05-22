



import Stripe from "stripe";
import { updateDocument } from "../../../helpers/index.js";

let stripe = new Stripe(process.env.STRIPE_SECRET_KEY);




const stripeSuccess = async(req, res) => {
  try {
 
      
    
    const [session, lineItems] = await Promise.all([
      stripe.checkout.sessions.retrieve(req.query.session_id, {
        expand: ['payment_intent.payment_method'],
      }),
      stripe.checkout.sessions.listLineItems(req.query.session_id),
    ]);
    
   
        // Debug log
        console.log("Stripe session: ", JSON.stringify(session, null, 2));
        console.log("Line items: ", JSON.stringify(lineItems, null, 2));
    
        const { card } = session.payment_intent.payment_method;
// Metadata se fees info le lo, agar available hai
    const metadata = session.metadata || {};
    console.log(metadata,"metadata----");
    
    const netAmount = metadata.netAmount ? parseInt(metadata.netAmount) : null;
    const stripeFee = metadata.stripeFee ? parseInt(metadata.stripeFee) : null;
    const totalAmount = metadata.totalAmount ? parseInt(metadata.totalAmount) : null;

        const cardDetails = {
          cardBrand: card?.brand,
          cardLast4: card?.last4,
          cardExpMonth: card?.exp_month,
          cardExpYear: card?.exp_year,
          cardFunding: card?.funding,
          cardCountry: card?.country,
        };

        if (session.payment_status === "paid") {
          // Example: find and update existing payment document
          await updateDocument(
            "payment",
            { stripeSessionId: session.id },
            {
              
              status: "Success",
              paymentIntentId: session.payment_intent?.id || null,
              paymentMethod: session.payment_intent?.payment_method?.type || "Stripe",
              transactionId: session.payment_intent?.id,
              presentmentAmount: session.payment_intent?.presentment_details?.presentment_amount,
              presentmentCurrency: session.payment_intent?.presentment_details?.presentment_currency,
              cardDetails,
              paidAt: new Date(session.created * 1000),
              customerEmail: session.customer_details?.email || null,
               // Added fees info in dollars (converted from cents)
          netAmount: netAmount !== null ? netAmount / 100 : null,
          stripeFee: stripeFee !== null ? stripeFee / 100 : null,
          totalAmount: totalAmount !== null ? totalAmount / 100 : null,
            }
          );
        }


    return res.send("<html><body style='background:#fff;'></body></html>");
  } catch (error) {
    return res.status(400).json({ status: 400, message: error.message });
  }
};

export default stripeSuccess;






