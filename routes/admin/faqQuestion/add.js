import Joi from "joi";
import {
  updateDocument,
  findOne,
  insertNewDocument,
} from "../../../helpers/index.js";

const schema = Joi.object({
  faqCategorieId: Joi.string().required(),
  faqCategorieName: Joi.string().required(),
  title: Joi.string().required(),
  answer: Joi.string().required(),
  status: Joi.string(),
  displayPosition: Joi.number().required(),
});

const addFaqQuestion = async (req, res) => {
  try {
    await schema.validateAsync(req.body);
    const { faqCategorieId, faqCategorieName, displayPosition } = req.body;

    const findFaqCategorie = await findOne("faqCategory", {
      _id: faqCategorieId,
    });
    if (!findFaqCategorie || findFaqCategorie.length === 0) {
      return res
        .status(400)
        .send({ status: 400, message: "No FAQ Category Found" });
    }

    const findFaqQuestionPosition = await findOne("faqQuestion", {
      displayPosition: displayPosition,
    });
    if (findFaqQuestionPosition) {
      return res.status(400).send({
        status: 400,
        message: "Already found question in displayPosition",
      });
    }

    const faqQuestion = await insertNewDocument("faqQuestion", { ...req.body });

    return res.status(200).send({ status: 200, faqQuestion });
  } catch (e) {
    console.log(e);
    return res.status(400).send({ status: 400, message: e.message });
  }
};

export default addFaqQuestion;
