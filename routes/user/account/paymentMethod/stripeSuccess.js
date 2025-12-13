



import Stripe from "stripe";
import { updateDocument, findAndSort } from "../../../../helpers/index.js";
import send_email from "../../../../lib/node-mailer/index.js";

let stripe = new Stripe(process.env.STRIPE_SECRET_KEY);




const stripeSuccess = async (req, res) => {
  try {



    const [session, lineItems] = await Promise.all([
      stripe.checkout.sessions.retrieve(req.query.session_id, {
        expand: ['payment_intent.payment_method'],
      }),
      stripe.checkout.sessions.listLineItems(req.query.session_id),
    ]);




    const { card } = session.payment_intent.payment_method;

    const cardDetails = {
      cardBrand: card?.brand,
      cardLast4: card?.last4,
      cardExpMonth: card?.exp_month,
      cardExpYear: card?.exp_year,
      cardFunding: card?.funding,
      cardCountry: card?.country,
    };
    // Pehle se saved totalAmount nikal lo (agar hai)
    const lastPayment = await findAndSort("userPayment", { stripeSessionId: session.id, sender: 'User' }, { createdAt: -1 });

    // Agar last totalAmount hai to use le lo, warna 0
    const previousAmount = lastPayment?.totalAmount || 0;

    // Ab ka amount (req.body se)
    const currentAmount = amount || 0;

    // Total calculate karo
    const totalAmount = previousAmount + currentAmount;
    if (session.payment_status === "paid") {
      // Example: find and update existing payment document
      const userAmountUpdate = await updateDocument(
        "userPayment",
        { stripeSessionId: session.id },
        {
          status: "Success",
          totalAmount,
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

    const updateProBookService = await updateDocument(
      "proBookingService",
      { _id: userAmountUpdate?.bookServiceId },
      {
        userPayToAdmin: "Completed",
        adminPayToPro: "Pending",
        //userToAdminPaypalCharges:paypalCharges
      }
    );
    let findUser = await findOne('user', { _id: updateProBookService?.userId })
    let findPro = await findOne('user', { _id: updateProBookService?.professsionalId })
    // 📧 Send payment success email to USER
    await send_email(
      "userBookingPaymentSuccess",
      {
        userName: findUser?.first_Name || findUser?.email,
        requestId: updateProBookService?.requestId,
        serviceName: updateProBookService?.serviceName,
        serviceType: updateProBookService?.serviceType,
        bookingDate: updateProBookService?.orderStartDate,
        bookingTime: updateProBookService?.orderStartTime,
        paymentMethod: userPayToAdmin?.paymentMethod,
        transactionId: token,
        totalAmount: updateProBookService?.total_amount_cus_pay_with_charges?.toFixed(2),
        paymentDate: new Date().toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })
      },
      process.env.SENDER_EMAIL,
      "Payment Confirmed - Booking Successful",
      findUser?.email
    );

    // 📧 Send new booking notification to PROFESSIONAL

    await send_email(
      "professionalNewBooking",
      {
        professionalName: findPro?.first_Name || findPro?.email,
        userName: findUser?.first_Name || findUser?.email,
        requestId: updateProBookService?.requestId,
        serviceName: updateProBookService?.serviceName,
        serviceType: updateProBookService?.serviceType,
        bookingDate: updateProBookService?.orderStartDate,
        bookingTime: updateProBookService?.orderStartTime,
        problemDescription: updateProBookService?.problemDescription || "No description provided",
        professionalEarnings: findPro?.totalEarnings
      },
      process.env.SENDER_EMAIL,
      "New Booking Request - Action Required",
      findPro?.email
    );
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