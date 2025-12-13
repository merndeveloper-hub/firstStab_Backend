import Joi from "joi";
import { insertNewDocument } from "../../../helpers/index.js";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.cloud_name,
  api_key: process.env.api_key,
  api_secret: process.env.api_secret,
});


const schema = Joi.object({
  name: Joi.string().required(),
  image: Joi.string(),
  icon: Joi.string(),
  commission: Joi.number().required(),
  taxCode: Joi.string().required(),
  description: Joi.string(),
  status: Joi.string(),
  type: Joi.string(),
  isRemote: Joi.string(),
  addToHome: Joi.string(),
});

const addCategory = async (req, res) => {
  try {
    const { error, value } = schema.validate(req.body, { abortEarly: false });

    if (error) {

      return res
        .status(400)
        .json({ success: false, message: error.details[0].message });
    }









    const category_Image = await cloudinary.uploader.upload(
      req?.files?.image?.path,
      { quality: 20 }
    );

    req.body.image = category_Image.url;



    const category_Icon = await cloudinary.uploader.upload(
      req?.files?.icon?.path,
      { quality: 20 }
    );

    req.body.icon = category_Icon.url;


    const category = await insertNewDocument("category", {
      ...req.body,

    });


    return res
      .status(200)
      .json({ status: 200, message: "Category uploaded successfully", data: { category } });
  } catch (e) {

    return res.status(500).json({ status: 500, message: e.message });
  }
};

export default addCategory;
