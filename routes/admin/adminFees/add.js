import Joi from "joi";
import {
  insertNewDocument,find
} from "../../../helpers/index.js";

const schema = Joi.object({
  registerationFees: Joi.number().required(),
  platformFees: Joi.number().required(),
  currency:Joi.string().required(),
  paypalFeePercentage:Joi.number().required(),
  paypalFixedFee:Joi.number().required(),
    stripeFeePercentage:Joi.number().required(),
  stripeFixedFee:Joi.number().required()
});

const adminCharges = async (req, res) => {
  try {
    await schema.validateAsync(req.body);
    const { registerationFees, platformFees,currency,paypalFeePercentage,paypalFixedFee,stripeFeePercentage,stripeFixedFee } = req.body;
 
    const getCharges = await find('adminFees')
    if(getCharges.length > 0){
    return res.status(400).send({ status: 400, messages:"Already Charges added.Kindly update if you want to change or contact to administration" });
    }

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
