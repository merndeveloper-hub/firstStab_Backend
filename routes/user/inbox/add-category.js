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
      console.error("Validation Error:", error);
      return res
        .status(400)
        .json({ success: false, message: error.details[0].message });
    }

   
   

  console.log(req?.files,"files");
  

    //if (req?.files?.categoryImage?.path) {
       
      const category_Image = await cloudinary.uploader.upload(
        req?.files?.image?.path,
        { quality: 20 }
      );

      req.body.image = category_Image.url;
      console.log(category_Image,"category_Image");
      // fs.unlinkSync(req.file.path);
      // console.log(req.files.categoryImage.path,"ching");
   // }
    // if (!req.files.categoryImage.path) {
    //   return res.status(400).json({
    //     status: 400,
    //     message: "Profile Image is required",
    //   });
    // }

    //if (req?.files?.categoryIcon?.path) {
      const category_Icon = await cloudinary.uploader.upload(
        req?.files?.icon?.path,
        { quality: 20 }
      );
    
      req.body.icon = category_Icon.url;
      console.log(category_Icon,"category_Image");
   // }

    //   if (!req.files.categoryIcon.path) {
    //   return res.status(400).json({
    //     status: 400,
    //     message: "Icon Image is required",
    //   });
    // }
    const category = await insertNewDocument("category", {
      ...req.body,
     // categoryImage: req.body.categoryImage,
     // categoryIcon:req.body.categoryIcon,
    });
console.log(category,"category11");

    return res
      .status(200)
      .json({ status: 200, message: "Category uploaded successfully", data:{category} });
  } catch (e) {
    console.log(e,"chec");
    return res.status(500).json({ status: 500, message: e.message });
  }
};

export default addCategory;
