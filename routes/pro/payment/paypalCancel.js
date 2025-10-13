import { deleteDocument, findOne } from "../../../helpers/index.js";
import send_email from "../../../lib/node-mailer/index.js";

const paymentCancel = async (req, res) => {
  try {
    const { token } = req.query;

const findPayment = await findOne("payment", {
      paypalOrderId: token,
    });

const findPro = await findOne("user", {
      _id: findPayment?.professionalId,
    });


    const deleteCancelPaypent = await deleteDocument("payment", {
      paypalOrderId: token,
    });

  
     await send_email(
    "proRegisterationPaymentSuccess",
    {
      user: findPro?.first_Name || findPro?.email,
      paymentMethod:"Paypal",
      failureReason:"Technical Problem"
     
    },
     "owaisy028@gmail.com",
    "Account Blocked Due to Multiple Failed Login Attempts",
    findPro?.email
  );

    return res.send("<html><body style='background:#fff;'></body></html>");
  } catch (error) {
    return res.status(400).json({ status: 400, message: error.message });
  }
};

export default paymentCancel;
