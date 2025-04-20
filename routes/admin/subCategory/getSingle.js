import Joi from "joi";
import { findOne, getAggregate } from "../../../helpers/index.js";


const schema = Joi.object().keys({
  id: Joi.string().required(),
});

const getSingleSubCategory = async (req, res) => {
  try {
    await schema.validateAsync(req.params);
    const { id } = req.params;

    const singleSubCategory = await findOne("subCategory", { _id: id });

    if (!singleSubCategory || singleSubCategory.length === 0) {
      return res.status(400).send({
        status: 400,
        message: "No sub category found",
      });
    }

    return res.status(200).json({ status: 200, data: { singleSubCategory } });
  } catch (e) {
    console.log(e);
    return res.status(400).json({ status: 400, message: e.message });
  }
};

export default getSingleSubCategory;
