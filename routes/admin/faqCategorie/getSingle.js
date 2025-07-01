import Joi from "joi";
// const { findOne } = require("../../../helpers");
import { findOne } from "../../../helpers/index.js";

const schema = Joi.object({
  id: Joi.string().required(),
});

const singleFaqCategory = async (req, res) => {
  try {
    await schema.validateAsync(req.params);

    const { id } = req.params;

    let faqCategory = await findOne("faqCategory", { _id: id });
    if (!faqCategory || faqCategory.length === 0) {
      return res
        .status(400)
        .send({ status: 400, message: "No FAQ Category Found" });
    }

    return res.status(200).send({ status: 200, faqCategory });
  } catch (e) {
    console.log(e);
    return res.status(400).send({ status: 400, message: e.message });
  }
};

export default singleFaqCategory;
