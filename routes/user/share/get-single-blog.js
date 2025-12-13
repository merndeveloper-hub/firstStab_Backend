import Joi from "joi";
import { findOne } from "../../../helpers/index.js";


const schema = Joi.object().keys({
  id: Joi.string().required(),
});

const getSingleCategory = async (req, res) => {
  try {
    await schema.validateAsync(req.params);
    const { id } = req.params;


    const singleCategory = await findOne("category", { _id: id })






    return res.status(200).json({ status: 200, data: { singleCategory } });
  } catch (e) {
    console.log(e);
    return res.status(500).json({ status: 500, message: e.message });
  }
};

export default getSingleCategory;
