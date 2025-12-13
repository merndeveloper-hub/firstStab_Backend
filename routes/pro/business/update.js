import Joi from "joi";
import {  updateDocument } from "../../../helpers/index.js";

const validationSchema = Joi.object({
  businessname: Joi.string(),
  businessaddress: Joi.string(),
  businessphoneNo: Joi.string()
      .required()
      .messages({
        "string.pattern.base": "Mobile number must be digits",
        "any.required": "Mobile number is required.",
      }),
  userId: Joi.string(),
});

const schema = Joi.object({
  id: Joi.string().required()
})

const updateBusiness = async (req, res) => {
  try {
    await validationSchema.validateAsync(req.body);

    const { id } = req.params;

    const createbus = await updateDocument(
      "user",
      { _id: id, userType: "pro" },
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
      message:"Buniness info updated successfully",
      data: createbus,
    });
  } catch (e) {
  
    console.log(e);
    return res.status(400).json({ status: 400, message: e.message });
  }
};

export default updateBusiness;
