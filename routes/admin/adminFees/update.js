import Joi from "joi";
// const { findOne } = require("../../../helpers");
import { findOne, updateDocument } from "../../../helpers/index.js";

const schema = Joi.object({
  registerationFees: Joi.number(),
  platformFees: Joi.number(),
  currency: Joi.string(),
    paypalFeePercentage:Joi.number(),
    paypalFixedFee:Joi.number(),
        stripeFeePercentage:Joi.number(),
      stripeFixedFee:Joi.number()
});

const schemaId = Joi.object({
  id: Joi.string().required(),
});
const updateAdminCharge = async (req, res) => {
  try {
    await schema.validateAsync(req.body);
    await schemaId.validateAsync(req.params);

    const { id } = req.params;
    const { registerationFees, platformFees, currency,paypalFeePercentage,paypalFixedFee,stripeFeePercentage,stripeFixedFee } = req.body;
    let getadminFees = await findOne("adminFees", { _id: id });

    if (!getadminFees || getadminFees.length === 0) {
      return res
        .status(400)
        .send({ status: 400, message: "Does not exist Data" });
    }

    const updateadminFees = await updateDocument(
      "adminFees",
      { _id: id },
      { ...req.body }
    );

    return res.status(200).send({
      status: 200,
      message: "Update App Charges Successfully",
      updateadminFees,
    });
  } catch (e) {
    console.log(e);
    return res.status(400).send({ status: 400, message: e.message });
  }
};

export default updateAdminCharge;
