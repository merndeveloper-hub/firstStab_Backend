import Joi from "joi";
import { insertNewDocument, findOne } from "../../../../helpers/index.js";

const schema = Joi.object({
   userId: Joi.string().hex().length(24).required(), // Must be a valid MongoDB ObjectId
  address_Type: Joi.string(),
  address_line1: Joi.string(),
  address_line2: Joi.string().allow("").optional(),
  state: Joi.string(),
  city: Joi.string(),
  zipCode: Joi.string(),
  mobile: Joi.string().pattern(new RegExp("^\\+?[0-9]{8,15}$")).messages({
    "string.pattern.base": "Mobile number must be 8-15 digits",
    "any.required": "Mobile number is required.",
  }),
});

const addAddress = async (req, res) => {
  try {
    await schema.validateAsync(req.body);
    const { userId } = req.body;
    const findUser = await findOne("user", { _id: userId });

    if (!findUser || findUser.length == 0) {
      return res.status(400).send({ status: 400, message: "No User found" });
    }

    const addAddress = await insertNewDocument(
      "address",

      {
        userId,
        ...req.body,
      }
    );

    return res.status(200).send({
      status: 200,
      message: "Address created successfully",
      data: { addAddress },
    });
  } catch (e) {
    console.log(e);
    return res.status(400).send({ status: 400, message: e.message });
  }
};

export default addAddress;
