import Joi from "joi";
// const { findOne } = require("../../../helpers");
import { findOne, updateDocument } from "../../../helpers/index.js";
import { v2 as cloudinary } from "cloudinary";
//import { cloudinary } from "../../../lib/index.js";
cloudinary.config({
  cloud_name: "dwebxmktr",
  api_key: "988681166781262",
  api_secret: "f4gUgqo7htBtD3eOGhfirdKd8kA",
});

const schema = Joi.object({
  title: Joi.string(),
  pageCode: Joi.number(),
  isSystemPage: Joi.string(),
  status: Joi.string(),
  contents: Joi.string()
});

const updateContentPage = async (req, res) => {
  try {
    await schema.validateAsync(req.body);

    const { id } = req.params;

    let contentPage = await findOne("content", { _id: id });

    if (!contentPage) {
      return res
        .status(400)
        .send({ status: 400, message: "Content Page not found" });
    }

    if (req?.files?.image?.path) {
      const category_Image = await cloudinary.uploader.upload(
        req?.files?.image?.path,
        { quality: 20, allowed_formats: ["jpg", "jpeg", "png", "jfif", "avif"] }
      );

      req.body.image = category_Image?.url;
    }

    const updateContentPage = await updateDocument(
      "content",
      { _id: id },
      { ...req.body }
    );


    return res
      .status(200)
      .send({
        status: 200,
        message: "Update Content Page Successfully",
        updateContentPage,
      });
  } catch (e) {
    console.log(e);
    return res.status(400).send({ status: 400, message: e.message });
  }
};

export default updateContentPage;
