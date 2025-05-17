import { find } from "../../../helpers/index.js";

const getMainCategories = async (req, res) => {
  try {
    const categories = await find("category");

    if (!categories || categories.length == 0) {
      return res.status(400).send({
        status: 400,
        message: "No category found",
      });
    }
    console.log(categories, "categories");

    let formattedCategories = categories.map((cat) => ({
      name: cat.name,
      id: cat._id,
      serviceCountry: cat.serviceCountry,
    }));

    return res
      .status(200)
      .json({ status: 200, data: { categories: formattedCategories } });
  } catch (e) {
    console.log(e);
    return res.status(400).json({ status: 400, message: e.message });
  }
};

export default getMainCategories;
