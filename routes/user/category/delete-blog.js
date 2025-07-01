import Joi from "joi";

import {
  insertNewDocument,
  deleteDocument,
  findOne,
} from "../../../helpers/index.js";

const schema = Joi.object({
  id: Joi.string().required(),
});

const deleteCategory = async (req, res) => {
  try {
    await schema.validateAsync(req.params);
    const { id } = req.params;
    const findCategory = await findOne("proCategory", { _id: id });
    if (!findCategory) {
      return res.status(404).send({ status: 404, message: "No category found" });
    }
    const category = await deleteDocument("proCategory", {
      _id: id,
    });

    return res
      .status(200)
      .send({ status: 200, message: "Category deleted successfully", data:{category} });
  } catch (e) {
    console.log(e);
    return res.status(500).send({ status: 500, message: e.message });
  }
};

export default deleteCategory;
