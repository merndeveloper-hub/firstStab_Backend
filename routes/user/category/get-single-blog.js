import Joi from "joi";
import { getDataWithLimit } from "../../../helpers/index.js";


const schema = Joi.object().keys({
  id: Joi.string().required(),
});

const getSingleCategory = async (req, res) => {
  try {
    await schema.validateAsync(req.params);
    const { id } = req.params;


    const page = parseInt(req.query.page) || 1; // Default to page 1


    const limit = 5; // Show 5 subcategories per page
    const skip = (page - 1) * limit;



    const singleCategories = await getDataWithLimit("subCategory", { categoryId: id }, skip, limit);



    return res.status(200).json({ status: 200, data: { singleCategories } });
  } catch (e) {
    console.log(e);
    return res.status(500).json({ status: 500, message: e.message });
  }
};

export default getSingleCategory;
