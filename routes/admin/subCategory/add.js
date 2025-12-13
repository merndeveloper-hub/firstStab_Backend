import Joi from "joi";
import { findOne, insertNewDocument } from "../../../helpers/index.js";
import { v2 as cloudinary } from "cloudinary";


cloudinary.config({
  cloud_name: process.env.cloud_name,
  api_key: process.env.api_key,
  api_secret: process.env.api_secret,
});

const schema = Joi.object({
  categoryId: Joi.string().required(),
  categoryName: Joi.string(),
  name: Joi.string().required(),
  description: Joi.string().required(),
  status: Joi.string(),
  addToHome: Joi.string(),
  isRemote: Joi.string().allow(null, ''),  // Allow empty strings, but check later
  isChat: Joi.string().allow(null, ''),
  isVirtual: Joi.string().allow(null, ''),
  isInPerson: Joi.string().allow(null, ''),
  serviceCountry: Joi.string().required(),
  commission: Joi.string().allow(null, ''),
  bgServiceName: Joi.string().required(),
  bgValidation: Joi.array().required(),
  complexity_tier: Joi.string().required(),
  price_model: Joi.string().required(),
  fixed_price: Joi.string().allow(null, ''),
  min_price: Joi.string().allow(null, ''),
  max_price: Joi.string().allow(null, ''),

}).or('isRemote', 'isChat', 'isVirtual', 'isInPerson')
  .messages({
    'object.missing': 'Please select at least one of isRemote, isChat, isVirtual, or isInPerson.',
  });


const addCategory = async (req, res) => {
  try {
    await schema.validateAsync(req.body);


    const { categoryId, bgServiceName, complexity_tier, price_model, fixed_price, min_price, max_price } = req.body;
  

    const categoryData = await findOne("category", {
      _id: categoryId,
    });
   

    if (!categoryData || categoryData.length === 0) {
      return res.status(400).send({
        status: 400,
        message: "No category found",
      });
    }

    if (categoryData?.serviceCountry == 'US' && bgServiceName != 'checkr') {
      return res.status(400).send({
        status: 400,
        message: "Select correct background service",
      });
    }

    if (categoryData?.serviceCountry == 'NON-US' && bgServiceName != 'certn') {
      return res.status(400).send({
        status: 400,
        message: "Select correct background service",
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

    let bgPackageName = "";
    if (bgServiceName == "checkr") {

      const validations = req.body.bgValidation;

      const hasCriminal = validations.includes("criminal");
      const hasLicense = validations.includes("licnce"); // assuming the typo is intentional

      if (hasCriminal && hasLicense) {
        bgPackageName = "basic_criminal_and_plv";
      } else if (hasLicense) {
        bgPackageName = "plv";
      } else if (hasCriminal) {
        bgPackageName = "basic_plus";
      }

    }


    if (bgServiceName == "Both") {

      const validations = req.body.bgValidation;

      const hasCriminal = validations.includes("criminal");
      const hasLicense = validations.includes("licnce"); // assuming the typo is intentional
      const hasIdVerification = validations.includes("IdVerification"); // certn bg


      if (hasCriminal && hasLicense) {
        bgPackageName = "basic_criminal_and_plv";
      } else if (hasLicense) {
        bgPackageName = "plv";
      } else if (hasCriminal) {
        bgPackageName = "basic_plus";
      } else if (hasIdVerification && hasCriminal && hasLicense) {
        bgPackageName = "both";
      }

    }



    const subCategory = await insertNewDocument("subCategory", {
      ...req.body,
      bgPackageName,
      categoryId: categoryData._id,
      categoryName: categoryData.name,
    });



    return res.status(200).send({
      status: 200,
      data: { subCategory },
    });
  } catch (e) {

    console.log(e);

    return res.status(400).send({ status: 400, message: e.message });
  }
};

export default addCategory;
