import Stripe from "stripe";
import { updateDocument, findOne } from "../../../helpers/index.js";
import createCandidates from "../../../lib/bgCheckr/checkr/create.js";
import createCandidatesCertn from "../../../lib/bgCheckr/certn/create.js";

let stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const stripeSuccess = async (req, res) => {
  try {
    const { professionalId, subCategorieId, proCategory } = req.query;

    const US_COUNTRIES = [
      "United States",
      "American Samoa",
      "Guam",
      "Northern Mariana Islands",
      "Puerto Rico",
      "U.S. Virgin Islands",
      "United States Minor Outlying Islands",
    ];

    // add bg code
    const findPro = await findOne("user", {
      _id: professionalId,
      userType: "pro",
    });
    let getCountry = US_COUNTRIES.includes(findPro?.country);
    console.log(getCountry, "getcouintry");

    const findSubCategorie = await findOne("subCategory", {
      _id: subCategorieId,
    });

    const serviceCountry = findSubCategorie?.serviceCountry;
    const bgServiceName = findSubCategorie?.bgServiceName;
    const bgValidation = findSubCategorie?.bgValidation;
    const userCountry = findPro?.country;
    const id = professionalId;
    const proCategoryId = proCategory;

    console.log(proCategoryId, "proCategoryId-------");

    if (
      serviceCountry == "NON-US" ||
      ("Both" && bgServiceName == "certn") ||
      ("Both" && getCountry == false)
    ) {
      console.log("vertn");

    const  invitationUrl = await createCandidatesCertn(
        id,
        bgServiceName,
        bgValidation,
        serviceCountry,
        userCountry,
        proCategoryId
      );
    } 
    else {
      const invitationUrl = await createCandidates(
        id,
        bgServiceName,
        bgValidation,
        serviceCountry,
        userCountry,
        proCategoryId
      );
    }

    const [session, lineItems] = await Promise.all([
      stripe.checkout.sessions.retrieve(req.query.session_id, {
        expand: ["payment_intent.payment_method"],
      }),
      stripe.checkout.sessions.listLineItems(req.query.session_id),
    ]);

    const { card } = session.payment_intent.payment_method;
    // Metadata se fees info le lo, agar available hai
    const metadata = session.metadata || {};

    const netAmount = metadata.netAmount ? parseInt(metadata.netAmount) : null;
    const stripeFee = metadata.stripeFee ? parseInt(metadata.stripeFee) : null;
    const totalAmount = metadata.totalAmount
      ? parseInt(metadata.totalAmount)
      : null;

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
          paymentMethod:
            session.payment_intent?.payment_method?.type || "Stripe",
          transactionId: session.payment_intent?.id,
          presentmentAmount:
            session.payment_intent?.presentment_details?.presentment_amount,
          presentmentCurrency:
            session.payment_intent?.presentment_details?.presentment_currency,
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
//console.log(invitationURL,"invitationURL...");

 return res.send(`
  <html>
    <body style="background:#fff; text-align:center; padding-top:50px;">
      <h2>Redirecting...</h2>
    </body>
  </html>
`);

    // return res.json({
    //   status: 200,
    //   data: { message: "Success", invitationURL: invitationURL?.invitation_url },
    // });

    //  return res.send("<html><body style='background:#fff;'></body></html>");
  } catch (error) {
    return res.status(400).json({ status: 400, message: error.message });
  }
};

export default stripeSuccess;
