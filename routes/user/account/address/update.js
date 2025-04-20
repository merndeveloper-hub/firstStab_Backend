import Joi from "joi";
import { updateDocument } from "../../../../helpers/index.js";

const schema = Joi.object({
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

const schemaId = Joi.object({
  id: Joi.string().required(),
});

const updateAddress = async (req, res) => {
  try {
    await schema.validateAsync(req.body);
    await schemaId.validateAsync(req.params);
    const { id } = req.params;
    const updatedAddress = await updateDocument(
      "address",

      {
        _id: id,
      },

      {
        ...req.body,
      }
    );

    if (!updatedAddress || updatedAddress.length == 0) {
      return res
        .status(400)
        .send({ status: 400, message: "Address Not found" });
    }

    return res.status(201).send({
      status: 201,
      message: "Address updated successfully",
      data: { updatedAddress },
    });
  } catch (e) {
    console.log(e);
    return res.status(400).send({ status: 400, message: e.message });
  }
};

export default updateAddress;
