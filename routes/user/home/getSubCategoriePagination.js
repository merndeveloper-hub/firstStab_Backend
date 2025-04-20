import Joi from "joi";
import { find, getDataWithLimit } from "../../../helpers/index.js";

const schema = Joi.object().keys({
  id: Joi.string().required(),
});

const getSubCateWithPagination = async (req, res) => {
  try {
    await schema.validateAsync(req.params);
    const { id } = req.params;

    const page = parseInt(req.query.page) || 1; // Default to page 1
    console.log(page, "page");

    const limit = 5; // Show 5 subcategories per page
    const skip = (page - 1) * limit;

    const singleSubCategories = await getDataWithLimit(
      "subCategory",
      { categoryId: id, status: "Active" },
      skip,
      limit
    );

    if (!singleSubCategories || singleSubCategories.length === 0) {
      return res.status(400).send({
        status: 400,
        message: "Sub Category Not found",
      });
    }


    const countSingleSubCategories = await find(
      "subCategory",
      { categoryId: id, status: "Active" }
    );

    return res.status(200).json({ status: 200, data: { singleSubCategories,count:countSingleSubCategories?.length } });
  } catch (e) {
    console.log(e);
    return res.status(400).json({ status: 400, message: e.message });
  }
};

export default getSubCateWithPagination;
