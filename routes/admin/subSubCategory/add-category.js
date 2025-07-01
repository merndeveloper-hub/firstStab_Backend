import Joi from "joi";
import { insertNewDocument } from "../../../helpers/index.js";
import { v2 as cloudinary } from "cloudinary";
//import { cloudinary } from "../../../lib/index.js";

cloudinary.config({
  cloud_name:'dwebxmktr',
  api_key: '988681166781262',
  api_secret: 'f4gUgqo7htBtD3eOGhfirdKd8kA',
});


const schema = Joi.object({
  categoryId: Joi.string().required(),
  categoryName: Joi.string().required(),
  subCategoryId: Joi.string().required(),
  subCategoryName: Joi.string().required(),
  name: Joi.string().required(),
  licenseRequired: Joi.string(),
  backgroundCheckRequired: Joi.string(),
  pros: Joi.string(),
  status: Joi.string()

});


 

const subSubAddCategory = async (req, res) => {
  try {
    const { error, value } = schema.validate(req.body, { abortEarly: false });

    if (error) {
      console.error("Validation Error:", error);
      return res
        .status(400)
        .json({ success: false, message: error.details[0].message });
    }

   
   console.log(req.body,"reqbody");
   
    const subCategory = await insertNewDocument("subCategory", {
      ...req.body,
     // categoryImage: req.body.categoryImage,
     // categoryIcon:req.body.categoryIcon,
    });


    return res
      .status(200)
      .send({ status: 200, message: "sub-SubCategory uploaded successfully", subCategory });
  } catch (e) {
   
    return res.status(500).send({ status: 500, message: e.message });
  }
};

export default subSubAddCategory;
