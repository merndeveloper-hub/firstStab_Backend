import Joi from "joi";
import {
  insertNewDocument,
} from "../../../helpers/index.js";

const schema = Joi.object({
  registerationFees: Joi.number().required(),
  platformFees: Joi.number().required(),
  currency:Joi.string().required(),
});

const adminCharges = async (req, res) => {
  try {
    await schema.validateAsync(req.body);
    const { registerationFees, platformFees,currency } = req.body;
 
    const adminAppCharges = await insertNewDocument("adminFees", {
      ...req.body,
    });

    return res.status(200).send({ status: 200, adminAppCharges });
  } catch (e) {
    console.log(e);
    return res.status(400).send({ status: 400, message: e.message });
  }
};

export default adminCharges;
