import Joi from "joi";
import fs from "fs";
import util from "util";
import { findOne, updateDocument } from "../../../helpers/index.js";
import { v2 as cloudinary } from "cloudinary";

// Promisify unlink to delete files
const unlinkFile = util.promisify(fs.unlink);

// Cloudinary config
cloudinary.config({
  cloud_name: "dwebxmktr",
  api_key: "988681166781262",
  api_secret: "f4gUgqo7htBtD3eOGhfirdKd8kA",
});

// Validation schemas
const schemaParams = Joi.object({
  id: Joi.string().required(),
});

const schemaBody = Joi.object({
  categoryId: Joi.string().required(),
  subCategoryId: Joi.string().required(),
  platformLinks: Joi.array()
    .items(Joi.string().uri().messages({
      'string.uri': 'Each platform link must be a valid URL',
    }))
    .optional()
    .messages({
      'array.base': 'platformLinks must be an array of URLs',
    }),
  socialMediaVerification: Joi.array()
    .items(Joi.string().uri().messages({
      'string.uri': 'Each social media link must be a valid URL',
    }))
    .optional()
    .messages({
      'array.base': 'socialMediaVerification must be an array of URLs',
    }),
});

// Optimized uploader
const uploadFile = async (file) => {
  const result = await cloudinary.uploader.upload(file.path, {
    resource_type: "auto",
    quality: "auto:eco",
    allowed_formats: ["jpg", "jpeg", "png", "jfif", "avif", "pdf"],
  });
  await unlinkFile(file.path); // Clean temp
  return result;
};

const temporaryCertificate = async (req, res) => {
  try {
    await schemaParams.validateAsync(req.params);
    await schemaBody.validateAsync(req.body);

    const { id } = req.params;
    const { platformLinks, categoryId, subCategoryId, socialMediaVerification } = req.body;

    const pro = await findOne("user", { _id: id, userType: "pro" });
    if (!pro) {
      return res.status(400).send({ status: 400, message: "No Professional found" });
    }

    // Upload multiple certificate files in parallel
    if (req?.files?.certificate) {
      const files = Array.isArray(req.files.certificate)
        ? req.files.certificate
        : [req.files.certificate];

      const uploaded = await Promise.all(files.map(uploadFile));
      req.body.certificate = uploaded.map(f => f.secure_url);
    }

    const updated = await updateDocument(
      "proCategory",
      { proId: id },
      {
        certificate: req.body.certificate || [],
        platformLinks: platformLinks || [],
        socialMediaVerification: socialMediaVerification || [],
      }
    );

    return res.status(200).send({
      status: 200,
      data: { proCategory: updated },
    });

  } catch (e) {
    console.error("Error in temporaryCertificate:", e);
    return res.status(400).send({ status: 400, message: e.message });
  }
};

export default temporaryCertificate;
