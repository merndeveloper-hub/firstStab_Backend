import Joi from "joi";
import { findOne, updateDocument } from "../../../helpers/index.js";
import { v2 as cloudinary } from "cloudinary";

// Cloudinary config
cloudinary.config({
  cloud_name: "dwebxmktr",
  api_key: "988681166781262",
  api_secret: "f4gUgqo7htBtD3eOGhfirdKd8kA",
});

// Schema validation (optional)
const schema = Joi.object({
  id: Joi.string().required(),

});

// Reusable uploader
const uploadFile = async (file) => {
  return await cloudinary.uploader.upload(file.path, {
    quality: 20,
    allowed_formats: ["jpg", "jpeg", "png", "jfif", "avif", "pdf"],
  });
};

const addCertificate = async (req, res) => {
  try {
    await schema.validateAsync(req.params)
    const {id} = req.params
    const {  isCompany, isUSBased,categoryId,subCategoryId,certificate,governmentId,companyRegistrationUrl
      ,tinUrl,w8BenUrl,w8BenEUrl
    } = req.body;
console.log(req.body,"body");

    const pro = await findOne("user", {
      _id: id,
      userType: "pro",
    });

    if (!pro) {
      return res.status(400).send({
        status: 400,
        message: "No Professional found",
      });
    }
let uploaded;
    // Explicit file uploads
    if (req?.files?.certificate?.path) {
       uploaded = await uploadFile(req.files.certificate);
      req.body.certificate = uploaded.url;
    }

    if (req?.files?.governmentId?.path) {
       uploaded = await uploadFile(req.files.governmentId);
      req.body.governmentId = uploaded.url;
    }

    if (req?.files?.companyRegistrationUrl?.path) {
       uploaded = await uploadFile(req.files.companyRegistrationUrl);
      req.body.companyRegistrationUrl = uploaded.url;
    }

    if (req?.files?.tinUrl?.path) {
       uploaded = await uploadFile(req.files.tinUrl);
      req.body.tinUrl = uploaded.url;
    }

    if (req?.files?.w8BenUrl?.path) {
       uploaded = await uploadFile(req.files.w8BenUrl);
      console.log(uploaded,"uploaded----");
      
      console.log(req.body.w8BenUrl,"req.body.w8BenUrl");
      
      req.body.w8BenUrl = uploaded.url;
    }

    if (req?.files?.w8BenEUrl?.path) {
       uploaded = await uploadFile(req.files.w8BenEUrl);
      req.body.w8BenEUrl = uploaded.url;
    }

    // Required checks
    if (!req.body.governmentId) {
      return res
        .status(400)
        .json({ status: 400, message: "Government ID is required" });
    }

    if (isUSBased == "true" && !req.body.tinUrl) {
      return res
        .status(400)
        .json({ status: 400, message: "TIN is required for US-based Pros" });
    }

    if (isUSBased == "false" && isCompany == "false" && !req.body.w8BenUrl) {
      return res
        .status(400)
        .json({ status: 400, message: "W-8BEN is required for Non-US Pros" });
    }

    if (
      isUSBased == "false" &&
      isCompany == "true" &&
      !req.body.w8BenEUrl &&
      !req.body.companyRegistrationUrl
    ) {
      return res.status(400).json({
        status: 400,
        message: "W-8BEN-E is required for Non-US Companies",
      });
    }
    if (
      isUSBased == "false" &&
      isCompany == "true" &&
      !req.body.companyRegistrationUrl
    ) {
      return res.status(400).json({
        status: 400,
        message: "Company Registration is required for Non-US Companies",
      });
    }

    // Save to DB

  


    const updated = await updateDocument(
      "proCategory",
      { proId: id,categoryId, "subCategories.id": subCategoryId},
      {
         status:"InActive",
        ...req.body,
      
      }
    );





    return res.status(200).send({
      status: 200,
      data: { proCategory: updated },
    });
  } catch (e) {
    console.error("Error in addCertificate:", e);
    return res.status(400).send({ status: 400, message: e.message });
  }
};

export default addCertificate;
