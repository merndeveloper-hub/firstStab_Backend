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
  name: Joi.string(),
  commission: Joi.number(),
  taxCode: Joi.string(),
  description: Joi.string(),
  status: Joi.string(),
  type: Joi.string(),
  isRemote: Joi.string(),
  addToHome: Joi.string(),
});
const schemaForId = Joi.object({
  id: Joi.string().required(),
});

const updateCategory = async (req, res) => {
  try {
    await schemaForId.validateAsync(req.params);
    await schema.validateAsync(req.body);
    const { id } = req.params;
    const findCategory = await findOne("category", { _id: id });
    if (!findCategory || findCategory.length === 0 ) {
      return res
        .status(400)
        .send({ status: 400, message: "Category not found" });
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
    const category = await updateDocument(
      "category",
      {
        _id: id,
      },
      {
        image: req?.body?.image,
        icon: req?.body?.icon,
        ...req.body,
      }
    );

    return res
      .status(200)
      .send({
        status: 200,
        message: "Category updated successfully",
        data: { category },
      });
  } catch (e) {
    console.log(e);
    return res.status(400).send({ status: 400, message: e.message });
  }
};

export default updateCategory;
