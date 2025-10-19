
import Joi from "joi";
import { findOne } from "../../../../helpers/index.js";



// ==========================================
//  CHECK STRIPE AND PAYPAL ACCOUNT IN DB //
// ==========================================

const checkAcctSchema = Joi.object({
  id: Joi.string().required(),
});

const checkAcctStatus = async (req, res) => {
  try {
    await checkAcctSchema.validateAsync(req.params);

    const { id } = req.params;

    const user = await findOne("user", { _id: id });
    if (!user || user.length === 0) {
      return res.status(400).json({
        status: 400,
        message: "User not found",
      });
    }

    return res.status(200).json({
      status: 200,
      message: "User Details",
      data: {
        user,
      },
    });
  } catch (e) {
    console.log(e);
    return res.status(400).json({
      status: 400,
      message: e.message,
    });
  }
};

export default checkAcctStatus;
