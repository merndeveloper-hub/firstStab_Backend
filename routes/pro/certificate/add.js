import Joi from "joi";
import { findOne, updateDocument } from "../../../helpers/index.js";
import { v2 as cloudinary } from "cloudinary";

// Cloudinary config
cloudinary.config({
  cloud_name: "dwebxmktr",
  api_key: "988681166781262",
  api_secret: "f4gUgqo7htBtD3eOGhfirdKd8kA",
});

// Schema validation
const schema = Joi.object({
  id: Joi.string().required(),
});

// Uploader
const uploadFile = async (file) =>
  cloudinary.uploader.upload(file.path, {
    quality: 20,
    resource_type: "auto",
    allowed_formats: [
      "jpg", "jpeg", "png", "jfif", "avif", "pdf",
      "mp4", "mov", "avi", "webm", "mkv"
    ],
  });


const addCertificate = async (req, res) => {
  try {
    await schema.validateAsync(req.params);
    const { id } = req.params;
    const {
      isCompany,
      isUSBased,
      categoryId,
      subCategoryId,
    } = req.body;

    const pro = await findOne("user", { _id: id, userType: "pro" });
    if (!pro) {
      return res.status(400).json({ status: 400, message: "No Professional found" });
    }

    const fileFields = [
      "passport",
      "drivingLicence",
      "selfieVideo",
      "certificationOrLicense",
      "proofOfInsurance",
      "governmentId",
      "companyRegistrationUrl",
      "formW9",
      "w8BenUrl",
      "w8BenEUrl",
    ];

    const uploadPromises = fileFields.map(async (field) => {
      if (req?.files?.[field]?.path) {
        const uploaded = await uploadFile(req.files[field]);
        req.body[field] = uploaded.url;
      }
    });

    await Promise.all(uploadPromises); // Parallel uploads

    // Required file validations
    // if (!req.body.governmentId) {
    //   return res.status(400).json({ status: 400, message: "Government ID is required" });
    // }

    if (!req.body.selfieVideo) {
      return res.status(400).json({ status: 400, message: "Selfie video is required" });
    }

    if (isUSBased === "true" && !req.body.formW9) {
      return res.status(400).json({ status: 400, message: "TIN is required for US-based Pros" });
    }

    if (isUSBased === "false" && isCompany === "false" && !req.body.w8BenUrl) {
      return res.status(400).json({ status: 400, message: "W-8BEN is required for Non-US Pros" });
    }

    if (
      isUSBased === "false" &&
      isCompany === "true" &&
      (!req.body.w8BenEUrl || !req.body.companyRegistrationUrl)
    ) {
      return res.status(400).json({
        status: 400,
        message: "W-8BEN-E and Company Registration are required for Non-US Companies",
      });
    }

    const updated = await updateDocument(
      "proCategory",
      { proId: id, categoryId, "subCategories.id": subCategoryId },
      { status: "InActive", ...req.body }
    );

    return res.status(200).json({
      status: 200,
      data: { proCategory: updated },
    });

  } catch (e) {
    console.error("Error in addCertificate:", e);
    return res.status(400).json({ status: 400, message: e.message });
  }
};

export default addCertificate;
