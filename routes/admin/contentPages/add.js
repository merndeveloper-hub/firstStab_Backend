import Joi from "joi";
import {
  updateDocument,
  findOne,
  insertNewDocument,
} from "../../../helpers/index.js";
import { v2 as cloudinary } from "cloudinary";
//import { cloudinary } from "../../../lib/index.js";
cloudinary.config({
  cloud_name: "dwebxmktr",
  api_key: "988681166781262",
  api_secret: "f4gUgqo7htBtD3eOGhfirdKd8kA",
});

const schema = Joi.object({
  title: Joi.string().required(),
  pageCode: Joi.number().required(),
  isSystemPage: Joi.string(),
  status: Joi.string().required(),
  contents: Joi.string().required(),
});

const addContentPage = async (req, res) => {
  try {
    await schema.validateAsync(req.body);
    const {title,pageCode,isSystemPage,status,contents} = req.body


    const contentData = await findOne("content", {
      title: title,
    });
 

    if (contentData) {
      return res.status(400).send({
        status: 400,
        message: "Content Title PAGE has already been taken",
      });
    }

    if (!req?.files?.image?.path) {
      return res.status(400).json({
        status: 400,
        message: "Image is required",
      });
    }
    const category_Icon = await cloudinary.uploader.upload(
      req?.files?.image?.path,
      { quality: 20, allowed_formats: ["jpg", "jpeg", "png", "jfif", "avif"] }
    );

    req.body.image = category_Icon.url;

    const addContent = await insertNewDocument("content", {
      ...req.body,
    });

    return res.status(200).send({
      status: 200,
      message: "Content created successfully",
      addContent,
    });
  } catch (e) {
    console.log(e);
    return res.status(500).send({ status: 500, message: e.message });
  }
};

export default addContentPage;
