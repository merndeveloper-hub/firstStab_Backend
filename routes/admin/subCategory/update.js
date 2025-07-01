import Joi from "joi";
import { updateDocument, findOne } from "../../../helpers/index.js";
import { v2 as cloudinary } from "cloudinary";
//import { cloudinary } from "../../../lib/index.js";
cloudinary.config({
  cloud_name: "dwebxmktr",
  api_key: "988681166781262",
  api_secret: "f4gUgqo7htBtD3eOGhfirdKd8kA",
});

const schema = Joi.object({
  categoryId: Joi.string(),
  categoryName: Joi.string(),
  name: Joi.string(),
  description: Joi.string(),
  status: Joi.string(),
  addToHome: Joi.string(),
  isRemote: Joi.string().allow(null, ""), // Allow empty strings, but check later
  isChat: Joi.string().allow(null, ""),
  isVirtual: Joi.string().allow(null, ""),
  isInPerson: Joi.string().allow(null, ""),
  serviceCountry: Joi.string(),
  commission: Joi.number(),
  bgServiceName: Joi.string(),
  bgValidation: Joi.array(),
    complexity_tier: Joi.string(),
     price_model: Joi.string().allow(null, ''),
      fixed_price: Joi.string().allow(null, ''),
       min_price: Joi.string().allow(null, ''),
        max_price: Joi.string().allow(null, ''),
});
const schemaForId = Joi.object({
  id: Joi.string().required(),
});

const updateSubCategory = async (req, res) => {
  try {
    await schemaForId.validateAsync(req.params);
    await schema.validateAsync(req.body);
    const{categoryName,
      name,
      description,
      status,
      addToHome,
      isRemote,
      isChat,
      isVirtual,
      isInPerson,
      commission,
      serviceCountry,
      bgServiceName,
      bgValidation,complexity_tier,price_model,fixed_price,min_price,max_price } = req.body
    const { id } = req.params;
    const findCategory = await findOne("subCategory", { _id: id });
    if (!findCategory) {
      return res
        .status(400)
        .send({ status: 400, message: "Sub Category not found" });
    }

    if (req?.files?.image?.path) {
      const category_Image = await cloudinary.uploader.upload(
        req?.files?.image?.path,
        { quality: 20, allowed_formats: ["jpg", "jpeg", "png", "jfif", "avif"] }
      );

      req.body.image = category_Image?.url;
    }

    if (req?.files?.icon?.path) {
      const category_Icon = await cloudinary.uploader.upload(
        req?.files?.icon?.path,
        { quality: 20, allowed_formats: ["jpg", "jpeg", "png", "jfif", "avif"] }
      );

      req.body.icon = category_Icon?.url;
    }

    const updateData = {};

 
    const subCategory = await updateDocument(
      "subCategory",
      {
        _id: id,
      },
      {
        image: req?.body?.image,
        icon: req?.body?.icon,
       ...req.body
      }
    );
    console.log(subCategory, "dub");

    return res.status(200).send({
      status: 200,
      message: "Sub Category updated successfully",
      data: { subCategory },
    });
  } catch (e) {
    return res.status(400).send({ status: 400, message: e.message });
  }
};

export default updateSubCategory;
