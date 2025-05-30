import Joi from "joi";
import { find } from "../../../helpers/index.js";

const schema = Joi.object().keys({
  id: Joi.string().required(),
});

const getServiceCategoryCount = async (req, res) => {
  try {
    await schema.validateAsync(req.params);
    const { id } = req.params;

    const getUserCategory = await find("proCategory", { proId: id });
    if (!getUserCategory || getUserCategory.length === 0) {
      return res.status(400).send({
        status: 400,
        message: "Service Not found",
      });
    }

    const getcategory = await find("category");
    const getSubCategories = await find("subCategory"); // 👈 fetch all subcategories

    const result = getUserCategory.map((item) => {
      const category = getcategory.find(
        (cat) => String(cat._id) === String(item.categoryId)
      );

      const selectedSubCatIds = item.subCategories.map((sc) => String(sc.id));

      // Subcategories for this category
      const subCategoriesForCategory = getSubCategories.filter(
        (subCat) => String(subCat.categoryId) === String(item.categoryId)
      );

      const formattedSubCategories = subCategoriesForCategory.map((subCat) => ({
        id: subCat._id,
        name: subCat.name,
        selected: selectedSubCatIds.includes(String(subCat._id)),
      }));

      return {
        name: category ? category.name : "Unknown",
        image:category ? category.image : "Unknown",
        icon:category ? category.icon : "Unknown",
        subCategoryCount: item.subCategories.length,
        subCategories: formattedSubCategories,
        item,
      };
    });

    const getBusinness = await find("user", { _id: id, userType: "pro" });

    if (!getBusinness || getBusinness.length === 0) {
      return res.status(400).send({
        status: 400,
        message: "No Business Info found",
      });
    }

    return res.status(200).json({
      status: 200,
      data: {
        result,
        getBusinnessName: getBusinness[0]?.businessname,
      },
    });
  } catch (e) {
    console.log(e);
    return res.status(400).json({ status: 400, message: e.message });
  }
};

export default getServiceCategoryCount;
