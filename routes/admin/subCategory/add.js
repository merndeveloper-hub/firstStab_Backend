import Joi from "joi";
import { findOne, insertNewDocument } from "../../../helpers/index.js";
import { v2 as cloudinary } from "cloudinary";
//import { cloudinary } from "../../../lib/index.js";

cloudinary.config({
  cloud_name: "dwebxmktr",
  api_key: "988681166781262",
  api_secret: "f4gUgqo7htBtD3eOGhfirdKd8kA",
});

const schema = Joi.object({
  categoryId: Joi.string().required(),
  categoryName: Joi.string(),
  name: Joi.string().required(),
  description: Joi.string().required(),
  status: Joi.string(),
  addToHome: Joi.string(),
  isRemote: Joi.string(),
  isChat: Joi.string(),
  isVirtual: Joi.string(),
  isInPerson: Joi.string(),
  price: Joi.string().required(),
});

const addCategory = async (req, res) => {
  try {
    await schema.validateAsync(req.body);

    const { categoryId } = req.body;
console.log(categoryId,"categoryId");

    const categoryData = await findOne("category", {
      _id: categoryId,
    });
console.log(categoryData,"daa");

    if (!categoryData || categoryData.length === 0) {
      return res.status(400).send({
        status: 400,
        message: "No category found",
      });
    }

    if (!req?.files?.icon?.path) {
      return res.status(400).json({
        status: 400,
        message: "Icon is required",
      });
    }
    const category_Icon = await cloudinary.uploader.upload(
      req?.files?.icon?.path,
      { quality: 20, allowed_formats: ["jpg", "jpeg", "png", "jfif", "avif"] }
    );

    req.body.icon = category_Icon.url;

    if (!req?.files?.image?.path) {
      return res.status(400).json({
        status: 400,
        message: "Image is required",
      });
    }

    const category_Image = await cloudinary.uploader.upload(
      req?.files?.image?.path,
      { quality: 20, allowed_formats: ["jpg", "jpeg", "png", "jfif", "avif"] }
    );

    req.body.image = category_Image.url;

    const subCategory = await insertNewDocument("subCategory", {
      ...req.body,
      categoryId: categoryData._id,
      categoryName: categoryData.name,
    });
    console.log(subCategory, "subCategory");

    return res.status(200).send({
      status: 200,
      data: { subCategory },
    });
  } catch (e) {
    return res.status(400).send({ status: 400, message: e.message });
  }
};

export default addCategory;
