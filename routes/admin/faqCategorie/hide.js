import Joi from "joi";
// const { findOne } = require("../../../helpers");
import { findOne, updateDocument } from "../../../helpers/index.js";

const schema = Joi.object({
  id: Joi.string(),
});

const hideFaqCaetgory = async (req, res) => {
  try {
    await schema.validateAsync(req.params);

    const { id } = req.params;

    let faqCategory = await findOne("faqCategory", { _id: id });
    if (!faqCategory || faqCategory.length === 0) {
      return res
        .status(400)
        .send({ status: 400, message: "No FAQ Category Found" });
    }

    const updatefaqCategory = await updateDocument(
      "faqCategory",
      { _id: id },
      { status: "InActive" }
    );

    return res.status(200).send({
      status: 200,
      message: "Update FAQ Category Successfully",
      updatefaqCategory,
    });
  } catch (e) {
    console.log(e);
    return res.status(400).send({ status: 400, message: e.message });
  }
};

export default hideFaqCaetgory;
