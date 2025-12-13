import axios from "axios";
import getAccessToken from "./accessToken.js";
import { findOne, updateDocument } from "../../../../helpers/index.js";
import send_email from "../../../../lib/node-mailer/index.js";

const paypalSuccess = async (req, res) => {
  try {
    const { token } = req.query;

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
      res.redirect(
        `${process.env.BACKEND_URL}/api/v1/user/account/payment/paypalcancel`
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
      captureId: executeResponse.data.purchase_units[0].payments.captures[0].id,
    };

    const purchaseUnitReference =
      executeResponse.data.purchase_units[0].reference_id; // purchase_units[0].reference_id

    const paypalLink = executeResponse.data.links[0].href; // links[0].href





    const getPaymentPlatformCharges = await axios.get(
      `${process.env.BACKEND_URL}/v2/payments/captures/${paymentSource.captureId}`,
      {
        headers: {
          Authorization: `Bearer ${getToken}`,
          "Content-Type": "application/json",
        },
      }
    );


    const paypalCharges = {
      gross_amount:
        getPaymentPlatformCharges?.data.seller_receivable_breakdown
          ?.gross_amount?.value,
      paypal_fee:
        getPaymentPlatformCharges?.data?.seller_receivable_breakdown?.paypal_fee
          ?.value,
      net_amount:
        getPaymentPlatformCharges?.data?.seller_receivable_breakdown?.net_amount
          ?.value,
    };

    const userPayToAdmin = await updateDocument(
      "userPayment",
      { paypalOrderId: token },
      {
        // totalAmount,
        status: executeResponse.data.status,
        authorizationId: executeResponse.data.id,
        payer,
        paypalCharges,
        paymentSource,
        payPalRefundLinkAdminToUser: getPaymentPlatformCharges?.data.links[1].href,
        purchaseUnitReference,
        paypalLink,
      }
    );

    const updateProBookService = await updateDocument(
      "proBookingService",
      { _id: userPayToAdmin?.bookServiceId },
      {
        userPayToAdmin: "Completed",
        adminPayToPro: "Pending",
        userToAdminPaypalCharges: paypalCharges
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
    res.redirect(
      `${process.env.BACKEND_URL}/api/v1/user/account/payment/paypalcancel`
    );
  }
};

export default paypalSuccess;
