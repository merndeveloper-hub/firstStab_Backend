import Joi from "joi";
import { findOne, insertNewDocument } from "../../../helpers/index.js";

const schema = Joi.object({
  fullName: Joi.string(),
  id: Joi.string(),
  email: Joi.string(),
  phoneNumber: Joi.number(),
  subject: Joi.string().required(),
  message: Joi.string().required(),
});

const contactUs = async (req, res) => {
  try {
    await schema.validateAsync(req.body);

    const getUser = await findOne("user", { _id: req.params.id });

    if (!getUser) {
      return res.status(400).json({ status: 400, message: "No User Found!" });
    }
    const contactUs = await insertNewDocument("contactUs", {
      fullName: getUser.first_Name + " " + getUser.last_Name,
      userId: getUser._id,
      email: getUser.email,
      phoneNumber: getUser.mobile,
      ...req.body,
    });

    return res.status(200).json({ status: 200, data: contactUs });
  } catch (e) {
    return res.status(500).json({ status: 500, message: e.message });
  }
};

export default contactUs;
