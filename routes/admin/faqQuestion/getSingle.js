import Joi from "joi";

import { findOne } from "../../../helpers/index.js";

const schema = Joi.object({
  id: Joi.string().required(),
});

const getFaqSingleQuestion = async (req, res) => {
  try {
    await schema.validateAsync(req.params);

    const { id } = req.params;

    let faqQuestion = await findOne("faqQuestion", { _id: id });

    if (!faqQuestion || faqQuestion.length === 0) {
      return res
        .status(400)
        .send({ status: 400, message: "Does not exist faq question" });
    }

    return res.status(200).send({ status: 200, faqQuestion });
  } catch (e) {
    console.log(e);
    return res.status(400).send({ status: 400, message: e.message });
  }
};

export default getFaqSingleQuestion;
