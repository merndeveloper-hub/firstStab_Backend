import Joi from "joi";
import {
  updateDocument,
  findOne,
  insertNewDocument,
} from "../../../helpers/index.js";

const schema = Joi.object({
  name: Joi.string().required(),
  status: Joi.string(),
});

const addfaqCategorie = async (req, res) => {
  try {
    await schema.validateAsync(req.body);
    const { name, status } = req.body;
    const findfaqCategorie = await findOne("faqCategory", {
      name: name,
    });

    if (findfaqCategorie) {
      return res.status(400).send({
        status: 400,
        message: `Name ${name} has already been taken`,
      });
    }
    const faqCategorie = await insertNewDocument("faqCategory", {
      ...req.body,
    });

    return res.status(200).send({ status: 200, faqCategorie });
  } catch (e) {
    console.log(e);
    return res.status(400).send({ status: 400, message: e.message });
  }
};

export default addfaqCategorie;
