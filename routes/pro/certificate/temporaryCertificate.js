import Joi from "joi";
import { findOne, updateDocument } from "../../../helpers/index.js";
import { v2 as cloudinary } from "cloudinary";

// Cloudinary config
cloudinary.config({
  cloud_name: "dwebxmktr",
  api_key: "988681166781262",
  api_secret: "f4gUgqo7htBtD3eOGhfirdKd8kA",
});

// Validation schema
const schemaBody = Joi.object({

  platformLinks: Joi.array()
    .items(
      Joi.string()
        .uri()
        .messages({
          'string.uri': 'Each platform link must be a valid URL',
        })
    )
    .optional()
    .messages({
      'array.base': 'Platform links must be an array of URLs',
    }),
});

const schema = Joi.object({

  id: Joi.string().required(),
});
// Uploader
const uploadFile = async (file) => {
  return await cloudinary.uploader.upload(file.path, {
    quality: 20,
    allowed_formats: ["jpg", "jpeg", "png", "jfif", "avif", "pdf"],
  });
};

const temporaryCertificate = async (req, res) => {
  try {
    await schema.validateAsync(req.params);
    await schemaBody.validateAsync(req.body)
    const { id } = req.params;
    const { platformLinks } = req.body;

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

    // Upload certificate images
    if (req?.files?.certificate) {
      const files = Array.isArray(req.files.certificate)
        ? req.files.certificate
        : [req.files.certificate];

      const uploaded = await Promise.all(files.map(uploadFile));
      req.body.certificate = uploaded.map(f => f.url);
    }

    const updated = await updateDocument(
      "proCategory",
      { proId: id },
      {
        certificate: req?.body?.certificate || [],
        platformLinks: platformLinks ?? [],
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

export default temporaryCertificate;
