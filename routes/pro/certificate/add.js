import Joi from "joi";
import {
  findOne,
  updateDocument,
} from "../../../helpers/index.js";
import { v2 as cloudinary } from "cloudinary";



cloudinary.config({
  cloud_name: "dwebxmktr",
  api_key: "988681166781262",
  api_secret: "f4gUgqo7htBtD3eOGhfirdKd8kA",
});

const schema = Joi.object({
  paymentStatus: Joi.string(),
  professionalId: Joi.string().required(),
  certificate: Joi.string(),
  portfolioLink: Joi.string(),
  platformLinks: Joi.array(),
  governmentId: Joi.string(),
});

const addCertificate = async (req, res) => {
  try {
    await schema.validateAsync(req.body);

    const {
      professionalId,
      paymentStatus,
      certificate,
      portfolioLink,
      governmentId,
      platformLinks,
    } = req.body;

    const getPro = await findOne("user", {
      _id: professionalId,
      userType: "pro",
    });

    if (!getPro || getPro.length === 0) {
      return res.status(400).send({
        status: 400,
        message: "No Professional found",
      });
    }

    // if (!req?.files?.certificate?.path) {
    //   return res.status(400).json({
    //     status: 400,
    //     message: "Certificate is required",
    //   });
    // }

    if (req?.files?.certificate?.path) {
      const certificateDoc = await cloudinary.uploader.upload(
        req?.files?.certificate?.path,
        { quality: 20, allowed_formats: ["jpg", "jpeg", "png", "jfif", "avif"] }
      );

      req.body.certificate = certificateDoc?.url;
    }

    if (!req?.files?.governmentId?.path) {
      return res.status(400).json({
        status: 400,
        message: "Image is required",
      });
    }

    const governmentIdDoc = await cloudinary.uploader.upload(
      req?.files?.governmentId?.path,
      { quality: 20, allowed_formats: ["jpg", "jpeg", "png", "jfif", "avif"] }
    );

    req.body.governmentId = governmentIdDoc.url;

    //    documents: {
    //   certificate: Joi.string(),
    //   portfolioLink: Joi.string(),
    //   platformLinks:Joi.array(),
    //   governmentId: Joi.string(),
    // },
    const proCategory = await updateDocument(
      "proCategory",
      { proId: professionalId },
      {
        ...req.body,
        documents: {
          ...req.body,
        },
      }
    );
    console.log(proCategory, "proCategory");

    return res.status(200).send({
      status: 200,
      data: { proCategory },
    });
  } catch (e) {
    console.log(e, "eeee");

    return res.status(400).send({ status: 400, message: e.message });
  }
};

export default addCertificate;
