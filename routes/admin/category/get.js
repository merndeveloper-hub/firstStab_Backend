import { find, getDataWithLimit } from "../../../helpers/index.js";

const getCategories = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;

    const limit = 5;
    const skip = (page - 1) * limit;
    const sort = { createdAt: -1 };
    const categories = await getDataWithLimit(
      "category",
      {},
      sort,
      skip,
      limit
    );

    if (!categories || categories.length == 0) {
      return res.status(400).send({
        status: 400,
        message: "No categories found",
      });
    }
const findCategorie = await find('category')
    return res.status(200).json({ status: 200, data: { categories,length:findCategorie?.length } });
  } catch (e) {
    console.log(e);
    return res.status(400).json({ status: 400, message: e.message });
  }
};

export default getCategories;
