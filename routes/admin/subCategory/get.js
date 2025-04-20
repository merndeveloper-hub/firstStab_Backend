import { find } from "../../../helpers/index.js";

const getSubCategories = async (req, res) => {
  try {
    const subcategories = await find("subCategory");
    

    if (!subcategories || subcategories.length === 0) {
     
      return res.status(400).send({
        status: 400,
        message: "No sub categories found"
      });
    }

    return res.status(200).json({ status: 200, data: { subcategories } });
  } catch (e) {
    console.log(e);
    return res.status(400).json({ status: 400, message: e.message });
  }
};

export default getSubCategories;
