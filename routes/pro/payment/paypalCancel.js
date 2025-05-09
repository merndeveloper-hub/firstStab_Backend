import { deleteDocument } from "../../../helpers/index.js";

const paymentCancel = async (req, res) => {
  try {
    const { token } = req.query;
    const deleteCancelPaypent = await deleteDocument("payment", {
      paypalOrderId: token,
    });

    return res.send("<html><body style='background:#fff;'></body></html>");
  } catch (error) {
    return res.status(400).json({ status: 400, message: error.message });
  }
};

export default paymentCancel;
