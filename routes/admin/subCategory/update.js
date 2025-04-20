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
   categoryName: Joi.string(),
   name: Joi.string(),
   description: Joi.string(),
   status: Joi.string(),
   addToHome: Joi.string(),
   isRemote: Joi.string(),
   isChat: Joi.string(),
   isVirtual: Joi.string(),
   isInPerson: Joi.string(),
   price: Joi.string(),
});
const schemaForId = Joi.object({
  id: Joi.string().required(),
});

const updateSubCategory = async (req, res) => {
  try {
    await schemaForId.validateAsync(req.params);
    await schema.validateAsync(req.body);
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
    const subCategory = await updateDocument(
      "subCategory",
      {
        _id: id,
      },
      {
        image: req?.body?.image,
        icon: req?.body?.icon,
        ...req.body,
      }
    );
console.log(subCategory,"dub");

    return res
      .status(200)
      .send({
        status: 200,
        message: "Sub Category updated successfully",
        data: { subCategory },
      });
  } catch (e) {
  
    return res.status(400).send({ status: 400, message: e.message });
  }
};

export default updateSubCategory;
