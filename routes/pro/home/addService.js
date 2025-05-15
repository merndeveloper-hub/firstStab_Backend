import Joi from "joi";
import { findOne, insertNewDocument } from "../../../helpers/index.js";

const schema = Joi.object({
  id: Joi.string().hex().length(24).required(),
  proId: Joi.string().hex().length(24).required(), // Must be a valid MongoDB ObjectId
  price: Joi.number().min(0).required(),
  categoryId: Joi.string().hex().length(24).required(),
  subCategories: Joi.array().items(
    Joi.object({
      id: Joi.string().hex().length(24).required(),
      isRemote: Joi.boolean(),
      isChat: Joi.boolean(),
      isVirtual: Joi.boolean(),
      isInPerson: Joi.boolean(),
    })
  ),
});

const createService = async (req, res) => {
  try {
    await schema.validateAsync(req.body);
    const { categoryId, id } = req.body;
    function isUSCountry(countryName) {
      const US_COUNTRIES = [
        "United States",
        "American Samoa",
        "Guam",
        "Northern Mariana Islands",
        "Puerto Rico",
        "U.S. Virgin Islands",
        "United States Minor Outlying Islands",
      ];

      return US_COUNTRIES.includes(countryName);
    }
    function NonUSCategory(findNonUSCategory) {
      const nonUSCategory = [
        "Film, Video & Motion Graphics",
        "Visual Arts and Graphic Design",
        "Online Marketing / Digital Advertising",
        "Company and Business Solutions",
        "Information Technology",
      ];

      return nonUSCategory.includes(findNonUSCategory);
    }
    const findPro = await findOne("user", { _id: id });

    country = findPro?.country;

    const checkUS = isUSCountry(country);

    console.log(checkUS, "checkUS");
    const findCategory = await findOne("categorie", { _id: categoryId });
    const findCountry = findCategory?.serviceCountry;
    const findNonUSCategory = findCategory?.name;
    const checkNonUSCategory = NonUSCategory(findNonUSCategory);
    if (checkUS && findCountry == "US" || findCountry == 'Both') {
      const category = await insertNewDocument("proCategory", {
        ...req.body,
      });

      return res.status(200).json({
        status: 200,
        message: "Category created successfully",
        category,
      });
    } else if (findCategory?.serviceCountry == "NON-US" && checkNonUSCategory || findCountry == 'Both') {
      const findCategory = await findOne("categorie", { _id: categoryId });
      const category = await insertNewDocument("proCategory", {
        categoryId: findCategory._id,
        ...req.body,
      });
      return res.status(200).json({
        status: 200,
        message: "Category created successfully",
        category,
      })
    }
  } catch (e) {
    return res.status(400).json({ status: 400, message: e.message });
  }
};

export default createService;
