import Joi from "joi";
// const { findOne } = require("../../../helpers");
import { findOne, updateDocument } from "../../../helpers/index.js";

const schema = Joi.object({
  faqCategorieid: Joi.string(),
  faqCategorieName: Joi.string(),
  title: Joi.string(),
  answer: Joi.string(),
  status: Joi.string(),
  displayPostion: Joi.number(),
});

const schemaId = Joi.object({
  id: Joi.string().required(),
});
const updateFaqQuestion = async (req, res) => {
  try {
    await schema.validateAsync(req.body);
    await schemaId.validateAsync(req.params);

    const { id } = req.params;

    let faqQuestion = await findOne("faqQuestion", { _id: id });

    if (!faqQuestion || faqQuestion.length === 0) {
      return res
        .status(400)
        .send({ status: 400, message: "Does not exist faq question" });
    }

    const updatefaqQuestion = await updateDocument(
      "faqQuestion",
      { _id: id },
      { ...req.body }
    );

    return res.status(200).send({
      status: 200,
      message: "Update FAQ Question Successfully",
      updatefaqQuestion,
    });
  } catch (e) {
    console.log(e);
    return res.status(400).send({ status: 400, message: e.message });
  }
};

export default updateFaqQuestion;
