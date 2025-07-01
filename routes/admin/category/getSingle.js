import Joi from "joi";
import { findOne, getAggregate } from "../../../helpers/index.js";
import ObjectID from "../../../types/index.js";

const schema = Joi.object().keys({
  id: Joi.string().required(),
});

const getSingleCategory = async (req, res) => {
  try {
    await schema.validateAsync(req.params);
    const { id } = req.params;

    const singleCategory = await findOne("category", { _id: id });

    if (!singleCategory || singleCategory.length === 0) {
      return res.status(400).send({
        status: 400,
        message: "No category found",
      });
    }

    return res.status(200).json({ status: 200, data: { singleCategory } });
  } catch (e) {
    console.log(e);
    return res.status(400).json({ status: 400, message: e.message });
  }
};

export default getSingleCategory;
