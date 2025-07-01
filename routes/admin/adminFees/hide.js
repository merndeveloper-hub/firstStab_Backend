import Joi from "joi";
// const { findOne } = require("../../../helpers");
import { findOne, updateDocument } from "../../../helpers/index.js";
const schema = Joi.object({
  id: Joi.string(),
});

const hideadminFees = async (req, res) => {
  try {
    await schema.validateAsync(req.params);

    const { id } = req.params;

    let getadminFees = await findOne("adminFees", { _id: id });

    if (!getadminFees || getadminFees.length === 0) {
      return res
        .status(400)
        .send({ status: 400, message: "Does not exist faq question" });
    }

    const updategetadminFees = await updateDocument(
      "adminFees",
      { _id: id },
      { status: getadminFees?.status == "Active" ? "InActive" : "Active" }
    );

    return res.status(200).send({
      status: 200,
      message: "Hide Charges Successfully",
      updategetadminFees,
    });
  } catch (e) {
    console.log(e);
    return res.status(400).send({ status: 400, message: e.message });
  }
};

export default hideadminFees;
