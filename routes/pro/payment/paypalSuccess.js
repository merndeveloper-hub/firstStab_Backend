import axios from "axios";
import getAccessToken from "./accessToken.js";
import { updateDocument, findOne } from "../../../helpers/index.js";
import createCandidates from "../../../lib/bgCheckr/checkr/create.js";
import createCandidatesCertn from "../../../lib/bgCheckr/certn/create.js";

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
      serviceCountry == "Both" &&
      bgServiceName == "Both" &&
    getCountry == false
    ) {
      console.log("vertn");

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

  //  console.log(invitationUrl, "invitationUrl-------------");

    const getToken = await getAccessToken();

    const executeResponse = await axios.post(
      `https://api-m.sandbox.paypal.com/v2/checkout/orders/${token}/capture`,
      {},
      {
        headers: {
          Authorization: `Bearer ${getToken}`,
          "Content-Type": "application/json",
        },
      }
    );
    console.log("Payment Captured:", executeResponse.data);

    if (!executeResponse || executeResponse.length == 0) {
      res.redirect("http://3.110.42.187:5000/api/v1/pro/payment/paypalcancel");
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

    console.log("Payment Success:", executeResponse.data);

    //return res.json({status:200,data:{message:"Success",invitationURL:invitationURL.invitation_url}})
    //return res.redirect(`myapp://payment-success?invitationUrl=${encodeURIComponent(invitationURL.invitation_url)}`);

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
    res.redirect("http://3.110.42.187:5000/api/v1/pro/payment/paypalcancel");
  }
};

export default paypalSuccess;
