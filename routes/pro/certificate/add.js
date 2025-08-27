import Joi from "joi";
import fs from "fs";
import { findOne, updateDocument } from "../../../helpers/index.js";
import { v2 as cloudinary } from "cloudinary";
import util from "util";

// Promisify fs.unlink for cleanup
const unlinkFile = util.promisify(fs.unlink);

// Cloudinary config
cloudinary.config({
  cloud_name: "dwebxmktr",
  api_key: "988681166781262",
  api_secret: "f4gUgqo7htBtD3eOGhfirdKd8kA",
});

// Joi validation
const schema = Joi.object({
  id: Joi.string().required(),
});

// Optimized Uploader
const uploadFile = async (file) => {
  const res = await cloudinary.uploader.upload(file.path, {
    resource_type: "auto",
    quality: "auto:eco", // More efficient
    allowed_formats: [
      "jpg", "jpeg", "png", "jfif", "avif", "pdf",
      "mp4", "mov", "avi", "webm", "mkv","pdf"
    ],
  });
  await unlinkFile(file.path); // Cleanup local file
  return res;
};

const addCertificate = async (req, res) => {
  try {
    await schema.validateAsync(req.params);
    const { id } = req.params;
    const { isCompany, isUSBased, categoryId, subCategoryId,preCondition } = req.body;

    const pro = await findOne("user", { _id: id, userType: "pro" });
    if (!pro) return res.status(400).json({ status: 400, message: "No Professional found" });

    const fileFields = [
      "passport", "drivingLicence", "selfieVideo",
      "certificationOrLicense", "proofOfInsurance",
      "governmentId", "companyRegistrationUrl",
      "formW9", "w8BenUrl", "w8BenEUrl",
    ];

    // Parallel uploads
    const uploadTasks = fileFields.map(async (field) => {
      const file = req?.files?.[field];
      if (file?.path) {
        const uploaded = await uploadFile(file);
        req.body[field] = uploaded.secure_url;
      }
    });
    await Promise.all(uploadTasks);

    if(preCondition == "true"){
      console.log("true");
      console.log(req.body,"body---");
      
console.log(req.files,"BOYD-----");
console.log(req.file,"file");

      // Validations (post-upload)
      if (!req.body.selfieVideo)
        return res.status(400).json({ status: 400, message: "Selfie video is required" });
    }
      

    if (isUSBased === "true" && !req.body.formW9)
      return res.status(400).json({ status: 400, message: "TIN is required for US-based Pros" });

    if (isUSBased === "false" && isCompany === "false" && !req.body.w8BenUrl)
      return res.status(400).json({ status: 400, message: "W-8BEN is required for Non-US Pros" });

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

    // Update DB
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
