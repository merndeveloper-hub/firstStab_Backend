// import Joi from "joi";
// import { findOne, updateDocument } from "../../../helpers/index.js";
// import { v2 as cloudinary } from "cloudinary";

// // Cloudinary config
// cloudinary.config({
//   cloud_name: "dwebxmktr",
//   api_key: "988681166781262",
//   api_secret: "f4gUgqo7htBtD3eOGhfirdKd8kA",
// });

// // Schema validation (optional)
// const schema = Joi.object({
//   id: Joi.string().required(),

// });

// // Reusable uploader
// const uploadFile = async (file) => {
//   return await cloudinary.uploader.upload(file.path, {
//     quality: 20,
//     allowed_formats: ["jpg", "jpeg", "png", "jfif", "avif", "pdf"],
//   });
// };

// const addCertificate = async (req, res) => {
//   try {
//     await schema.validateAsync(req.params)
//     const {id} = req.params
//     const {  isCompany, isUSBased,categoryId,subCategoryId,certificate,governmentId,companyRegistrationUrl
//      ,certificationOrLicense,proofOfInsurance,formW9 ,drivingLicence,passport,w8BenUrl,w8BenEUrl,selfieVideo
//     } = req.body;
// console.log(req.body,"body");

//     const pro = await findOne("user", {
//       _id: id,
//       userType: "pro",
//     });

//     if (!pro) {
//       return res.status(400).send({
//         status: 400,
//         message: "No Professional found",
//       });
//     }
// let uploaded;

//  passport: { type: schemaType.TypeString },
//       drivingLicence: { type: schemaType.TypeString },
//        selfieVideo: { type: schemaType.TypeString },

//     // Explicit file uploads
//     if (req?.files?.passport?.path) {
//        uploaded = await uploadFile(req.files.passport);
//       req.body.passport = uploaded.url;
//     }

//   if (req?.files?.certificationOrLicense?.path) {
//        uploaded = await uploadFile(req.files.certificationOrLicense);
//       req.body.certificationOrLicense = uploaded.url;
//     }
//  if (req?.files?.drivingLicence?.path) {
//        uploaded = await uploadFile(req.files.drivingLicence);
//       req.body.drivingLicence = uploaded.url;
//     }
//      if (req?.files?.proofOfInsurance?.path) {
//        uploaded = await uploadFile(req.files.proofOfInsurance);
//       req.body.proofOfInsurance = uploaded.url;
//     }

//     if (req?.files?.governmentId?.path) {
//        uploaded = await uploadFile(req.files.governmentId);
//       req.body.governmentId = uploaded.url;
//     }
// if (req?.files?.selfieVideo?.path) {
//        uploaded = await uploadFile(req.files.selfieVideo);
//       req.body.selfieVideo = uploaded.url;
//     }
//     if (req?.files?.companyRegistrationUrl?.path) {
//        uploaded = await uploadFile(req.files.companyRegistrationUrl);
//       req.body.companyRegistrationUrl = uploaded.url;
//     }

//     if (req?.files?.formW9?.path) {
//        uploaded = await uploadFile(req.files.formW9);
//       req.body.formW9 = uploaded.url;
//     }

//     if (req?.files?.w8BenUrl?.path) {
//        uploaded = await uploadFile(req.files.w8BenUrl);
//       console.log(uploaded,"uploaded----");
      
//       console.log(req.body.w8BenUrl,"req.body.w8BenUrl");
      
//       req.body.w8BenUrl = uploaded.url;
//     }

//     if (req?.files?.w8BenEUrl?.path) {
//        uploaded = await uploadFile(req.files.w8BenEUrl);
//       req.body.w8BenEUrl = uploaded.url;
//     }

//     // Required checks
//     if (!req.body.governmentId) {
//       return res
//         .status(400)
//         .json({ status: 400, message: "Government ID is required" });
//     }
// // Required checks
//     if (!req.body.selfieVideo) {
//       return res
//         .status(400)
//         .json({ status: 400, message: "selfieVideo is required" });
//     }
//     if (isUSBased == "true" && !req.body.formW9) {
//       return res
//         .status(400)
//         .json({ status: 400, message: "TIN is required for US-based Pros" });
//     }

//     if (isUSBased == "false" && isCompany == "false" && !req.body.w8BenUrl) {
//       return res
//         .status(400)
//         .json({ status: 400, message: "W-8BEN is required for Non-US Pros" });
//     }

//     if (
//       isUSBased == "false" &&
//       isCompany == "true" &&
//       !req.body.w8BenEUrl &&
//       !req.body.companyRegistrationUrl
//     ) {
//       return res.status(400).json({
//         status: 400,
//         message: "W-8BEN-E is required for Non-US Companies",
//       });
//     }
//     if (
//       isUSBased == "false" &&
//       isCompany == "true" &&
//       !req.body.companyRegistrationUrl
//     ) {
//       return res.status(400).json({
//         status: 400,
//         message: "Company Registration is required for Non-US Companies",
//       });
//     }

//     // Save to DB

  


//     const updated = await updateDocument(
//       "proCategory",
//       { proId: id,categoryId, "subCategories.id": subCategoryId},
//       {
//          status:"InActive",
//         ...req.body,
      
//       }
//     );





//     return res.status(200).send({
//       status: 200,
//       data: { proCategory: updated },
//     });
//   } catch (e) {
//     console.error("Error in addCertificate:", e);
//     return res.status(400).send({ status: 400, message: e.message });
//   }
// };

// export default addCertificate;


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
    allowed_formats: ["jpg", "jpeg", "png", "jfif", "avif", "pdf"],
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
    if (!req.body.governmentId) {
      return res.status(400).json({ status: 400, message: "Government ID is required" });
    }

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
