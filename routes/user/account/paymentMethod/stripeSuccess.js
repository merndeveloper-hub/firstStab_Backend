



import Stripe from "stripe";
import { updateDocument } from "../../../../helpers/index.js";

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
            "userPayment",
            { stripeSessionId: session.id },
            {
              status: "Success",
              paymentIntentId: session.payment_intent?.id || null,
              paymentMethod: session.payment_intent?.payment_method?.type || "card",
              transactionId: session.payment_intent?.id,
              presentmentAmount: session.payment_intent?.presentment_details?.presentment_amount,
              presentmentCurrency: session.payment_intent?.presentment_details?.presentment_currency,
              cardDetails,
              paidAt: new Date(session.created * 1000),
              customerEmail: session.customer_details?.email || null,
            }
          );
        }


    return res.send("<html><body style='background:#fff;'></body></html>");
  } catch (error) {
    return res.status(400).json({ status: 400, message: error.message });
  }
};

export default stripeSuccess;






// app.get('/complete', async (req, res) => {
//   const result = Promise.all([
//       stripe.checkout.sessions.retrieve(req.query.session_id, { expand: ['payment_intent.payment_method'] }),
//       stripe.checkout.sessions.listLineItems(req.query.session_id)
//   ])

//   console.log(JSON.stringify(await result))

//   res.send('Your payment was successful')
// })