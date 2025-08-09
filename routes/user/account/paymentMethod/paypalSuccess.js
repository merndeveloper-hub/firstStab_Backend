import axios from "axios";
import getAccessToken from "./accessToken.js";
import { updateDocument,findAndSort } from "../../../../helpers/index.js";

const paypalSuccess = async (req, res) => {
  try {
    const { token } = req.query;

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
      res.redirect(
        "http://3.110.42.187:5000/api/v1/user/account/payment/paypalcancel"
      );
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
    
// // Pehle se saved totalAmount nikal lo (agar hai)
// const lastPayment = await findAndSort("userPayment", { paypalOrderId: token,sender:'User' },{ createdAt: -1  });

// // Agar last totalAmount hai to use le lo, warna 0
// const previousAmount = lastPayment?.totalAmount || 0;

// // Ab ka amount (req.body se)
// const currentAmount = amount || 0;

// // Total calculate karo
// const totalAmount = previousAmount + currentAmount;
    await updateDocument(
      "userPayment",
      { paypalOrderId: token },
      {
       // totalAmount,
        status: executeResponse.data.status,
        authorizationId: executeResponse.data.id,
        payer,
        paymentSource,
        purchaseUnitReference,
        paypalLink,
      }
    );

    console.log("Payment Success:", executeResponse.data);
    return res.send("<html><body style='background:#fff;'></body></html>");

   
  } catch (error) {
    console.error(
      "Error executing PayPal payment:",
      error.response ? error.response.data : error.message
    );
    res.redirect(
      "http://3.110.42.187:5000/api/v1/user/account/payment/paypalcancel"
    );
  }
};

export default paypalSuccess;
