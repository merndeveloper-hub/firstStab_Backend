import Joi from "joi";
import { insertNewDocument } from "../../../helpers/index.js";
import { v2 as cloudinary } from "cloudinary";
//import { cloudinary } from "../../../lib/index.js";
cloudinary.config({
  cloud_name: "dwebxmktr",
  api_key: "988681166781262",
  api_secret: "f4gUgqo7htBtD3eOGhfirdKd8kA",
});

const schema = Joi.object({
  name: Joi.string().required(),
  commission: Joi.number().required(),
  taxCode: Joi.string().required(),
  description: Joi.string(),
  status: Joi.string(),
  type: Joi.string(),
  isRemote: Joi.string(),
  addToHome: Joi.string(),
});

const createCategory = async (req, res) => {
  try {
    await schema.validateAsync(req.body);

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
    console.log(category_Icon, "category_Image");

    const category = await insertNewDocument("category", {
      ...req.body,
    });

    return res.status(200).json({ status: 200, data: { category } });
  } catch (e) {
    return res.status(400).json({ status: 400, message: e.message });
  }
};

export default createCategory;
