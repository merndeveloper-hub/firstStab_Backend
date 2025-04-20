import Joi from "joi";
import {
  findOne,
  updateDocument,
} from "../../../helpers/index.js";

const schema = Joi.object({
  id: Joi.string().required(),
});

const hideSubCategory = async (req, res) => {
  try {
    await schema.validateAsync(req.params);
    const { id } = req.params;
    const findSubCategory = await findOne("subCategory", { _id: id });
    if (!findSubCategory || findSubCategory.length === 0) {
      return res.status(400).send({
        status: 400,
        message: "No sub category found",
      });
    }
    const category = await updateDocument(
      "subCategory",
      {
        _id: id,
      },
      { status: "InActive" }
    );

    return res
      .status(200)
      .send({
        status: 200,
        message: "Sub Category updated successfully",
        data: { category },
      });
  } catch (e) {
    console.log(e);
    return res.status(400).send({ status: 400, message: e.message });
  }
};

export default hideSubCategory;
