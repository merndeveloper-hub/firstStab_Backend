import Joi from "joi";
import {
  findOne,
  updateDocument,
} from "../../../helpers/index.js";

const schema = Joi.object({
  id: Joi.string().required(),
});

const hideCategory = async (req, res) => {
  try {
    await schema.validateAsync(req.params);
    const { id } = req.params;
    const findCategory = await findOne("category", { _id: id });
    if (!findCategory || findCategory.length === 0) {
      return res.status(400).send({
        status: 400,
        message: "No category found",
      });
    }
    const category = await updateDocument(
      "category",
      {
        _id: id,
      },
      { status: "InActive" }
    );

    return res
      .status(200)
      .send({
        status: 200,
        message: "Category updated successfully",
        data: { category },
      });
  } catch (e) {
    console.log(e);
    return res.status(400).send({ status: 400, message: e.message });
  }
};

export default hideCategory;
