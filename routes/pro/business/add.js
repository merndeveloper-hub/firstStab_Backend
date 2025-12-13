import Joi from "joi";
import { updateDocument } from "../../../helpers/index.js";

const validationSchema = Joi.object({
  businessname: Joi.string(),
  businessaddress: Joi.string(),
  businessphoneNo: Joi.string()
    .required()
    .messages({
      "string.pattern.base": "Mobile number must be digits",
      "any.required": "Mobile number is required.",
    }),
  userId: Joi.string().required(),
});

const createbusiness = async (req, res) => {
  try {
    await validationSchema.validateAsync(req.body);

    const { userId } = req.body;

    const createbus = await updateDocument(
      "user",
      { _id: userId, userType: "pro" },
      { ...req.body }
    );
    if (!createbus || createbus.length === 0) {
      return res.status(400).json({
        status: 400,
        message: "User not found",
      });
    }

    return res.status(200).json({
      status: 200,
      data: createbus,
    });
  } catch (e) {

    console.log(e);
    return res.status(400).json({ status: 400, message: e.message });
  }
};

export default createbusiness;
