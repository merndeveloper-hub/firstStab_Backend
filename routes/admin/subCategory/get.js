import { find, getDataWithLimit } from "../../../helpers/index.js";

const getSubCategories = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;

    const limit = 5;
    const skip = (page - 1) * limit;
    const sort = { createdAt: -1 };
    const subcategories = await getDataWithLimit(
      "subCategory",
      {},
      sort,
      skip,
      limit
    );

    if (!subcategories || subcategories.length === 0) {
      return res.status(400).send({
        status: 400,
        message: "No sub categories found",
      });
    }

    return res.status(200).json({ status: 200, data: { subcategories } });
  } catch (e) {
    console.log(e);
    return res.status(400).json({ status: 400, message: e.message });
  }
};

export default getSubCategories;
