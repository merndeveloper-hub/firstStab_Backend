import { find } from "../../../helpers/index.js";

const getCategories = async (req, res) => {
  try {
    const categories = await find("category",{status:"Active"});
    

    if (!categories || categories.length === 0) {
     
      return res.status(400).send({
        status: 400,
        message: "Category Not found"
      });
    }

    return res.status(200).json({ status: 200, data: { categories } });
  } catch (e) {
    console.log(e);
    return res.status(400).json({ status: 400, message: e.message });
  }
};

export default getCategories;
