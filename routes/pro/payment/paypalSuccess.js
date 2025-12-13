import axios from "axios";
import getAccessToken from "./accessToken.js";
import { updateDocument, findOne } from "../../../helpers/index.js";
import createCandidates from "../../../lib/bgCheckr/checkr/create.js";
import createCandidatesCertn from "../../../lib/bgCheckr/certn/create.js";
import send_email from "../../../lib/node-mailer/index.js";

const paypalSuccess = async (req, res) => {
  try {
    const { token, professionalId, subCategorieId, proCategory } = req.query;

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


    const findSubCategorie = await findOne("subCategory", {
      _id: subCategorieId,
    });

    const serviceCountry = findSubCategorie?.serviceCountry;
    const bgServiceName = findSubCategorie?.bgServiceName;
    const bgValidation = findSubCategorie?.bgValidation;
    const userCountry = findPro?.country;
    const id = professionalId;
    const proCategoryId = proCategory;



    if (
      serviceCountry == "Both" &&
      bgServiceName == "Both" &&
      getCountry == false
    ) {


      const invitationUrl = await createCandidatesCertn(
        id,
        bgServiceName,
        bgValidation,
        serviceCountry,
        userCountry,
        proCategoryId
      );
    } else {
      const invitationUrl = await createCandidates(
        id,
        bgServiceName,
        bgValidation,
        serviceCountry,
        userCountry,
        proCategoryId
      );
    }



    const getToken = await getAccessToken();

    const executeResponse = await axios.post(
      `${process.env.PAYPAL_API_DEVELOPMENT_URL}/v2/checkout/orders/${token}/capture`,
      {},
      {
        headers: {
          Authorization: `Bearer ${getToken}`,
          "Content-Type": "application/json",
        },
      }
    );


    if (!executeResponse || executeResponse.length == 0) {
      res.redirect(`${process.env.BACKEND_URL}/api/v1/pro/payment/paypalcancel`);
    }

    const payer = {
      payerId: executeResponse.data.payer.payer_id, // payer_id
      payerEmail: executeResponse.data.payer.email_address,
      payerFirstName: executeResponse.data.payer.name.given_name,
      payerLastName: executeResponse.data.payer.name.surname,
      payerCountryCode: executeResponse.data.payer.address.country_code,
    };

    const paymentSource = {
      paypalAccountId: executeResponse.data.payment_source.paypal.account_id,
      paypalEmail: executeResponse.data.payment_source.paypal.email_address,
      paypalAccountStatus:
        executeResponse.data.payment_source.paypal.account_status,
    };

    const purchaseUnitReference =
      executeResponse.data.purchase_units[0].reference_id; // purchase_units[0].reference_id

    const paypalLink = executeResponse.data.links[0].href; // links[0].href

    await updateDocument(
      "payment",
      { paypalOrderId: token },
      {
        status: executeResponse.data.status,
        authorizationId: executeResponse.data.id,
        payer,
        paymentSource,
        purchaseUnitReference,
        paypalLink,
      }
    );

   

    
    
    // File: paypalsuccess.js (success route mein)

await send_email(
  "proRegisterationPaymentSuccess",
  {
    user: findPro?.first_Name || findPro?.email,
    paymentMethod: "PayPal",
    transactionId: token, // PayPal transaction ID
    amountPaid: findPayment?.finalAmount?.toFixed(2) || "0.00",
    paymentDate: new Date().toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
  },
  process.env.SENDER_EMAIL,
  "Payment Successful - Registration Complete",
  findPro?.email
);

    return res.send(`
  <html>
    <body style="background:#fff; text-align:center; padding-top:50px;">
      <h2>Redirecting...</h2>
    </body>
  </html>
`);
  } catch (error) {
    console.error(
      "Error executing PayPal payment:",
      error.response ? error.response.data : error.message
    );
    res.redirect(`${process.env.BACKEND_URL}/api/v1/pro/payment/paypalcancel`);
  }
};

export default paypalSuccess;
