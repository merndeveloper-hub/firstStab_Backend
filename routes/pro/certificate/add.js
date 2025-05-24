// import Joi from "joi";
// import {
//   findOne,
//   updateDocument,
// } from "../../../helpers/index.js";
// import { v2 as cloudinary } from "cloudinary";



// cloudinary.config({
//   cloud_name: "dwebxmktr",
//   api_key: "988681166781262",
//   api_secret: "f4gUgqo7htBtD3eOGhfirdKd8kA",
// });

// const schema = Joi.object({
//   paymentStatus: Joi.string(),
//   professionalId: Joi.string().required(),
//   certificate: Joi.string(),
//   portfolioLink: Joi.string(),
//   platformLinks: Joi.array(),
//   governmentId: Joi.string(),
// });

// const addCertificate = async (req, res) => {
//   try {
//    // await schema.validateAsync(req.body);

//     const {
//       professionalId,
//       paymentStatus,
//       certificate,
//       portfolioLink,
//       governmentId,
//       platformLinks,
//       isCompany,
//       isUSBased,
//       governmentIdUrl,
//       ratingsUrls,
//       certificates,
//       insuranceUrl,
//       companyRegistrationUrl,
//       tinUrl,
//       w8BenUrl,
//       w8BenEUrl,
//     } = req.body;

//     const getPro = await findOne("user", {
//       _id: professionalId,
//       userType: "pro",
//     });

//     if (!getPro || getPro.length === 0) {
//       return res.status(400).send({
//         status: 400,
//         message: "No Professional found",
//       });
//     }

//     // if (!req?.files?.certificate?.path) {
//     //   return res.status(400).json({
//     //     status: 400,
//     //     message: "Certificate is required",
//     //   });
//     // }

//     if (req?.files?.certificate?.path) {
//       const certificateDoc = await cloudinary.uploader.upload(
//         req?.files?.certificate?.path,
//         { quality: 20, allowed_formats: ["jpg", "jpeg", "png", "jfif", "avif"] }
//       );

//       req.body.certificate = certificateDoc?.url;
//     }

//     if (!req?.files?.governmentId?.path) {
//       return res.status(400).json({
//         status: 400,
//         message: "governmentId is required ",
//       });
//     }

//     const governmentIdDoc = await cloudinary.uploader.upload(
//       req?.files?.governmentId?.path,
//       { quality: 20, allowed_formats: ["jpg", "jpeg", "png", "jfif", "avif"] }
//     );

//     req.body.governmentId = governmentIdDoc.url;

// // if company is true to required give comapny registereation doc
//  if (isCompany && !req?.files?.companyRegistrationUrl?.path) {
     
//       return res.status(400).json({
//         status: 400,
//         message: "Company Registration is required for companies",
//       });
//     }

//     const companyRegistration = await cloudinary.uploader.upload(
//       req?.files?.companyRegistrationUrl?.path,
//       { quality: 20, allowed_formats: ["jpg", "jpeg", "png", "jfif", "avif"] }
//     );

//     req.body.companyRegistrationUrl = companyRegistration.url;
    
  


//       // if Pro US based to required submit TIN doc
//  if (isUSBased && !req?.files?.tinUrl?.path) {
     
//       return res.status(400).json({
//         status: 400,
//         message: "TIN is required for US-based Pros",
//       });
//     }

//     const tin = await cloudinary.uploader.upload(
//       req?.files?.tinUrl?.path,
//       { quality: 20, allowed_formats: ["jpg", "jpeg", "png", "jfif", "avif"] }
//     );

//     req.body.tinUrl = tin.url;
      

// if (!isUSBased && !w8BenUrl && !w8BenEUrl) {
//         return res.status(400).json({ error: 'W-8BEN or W-8BEN-E is required for Non-US Pros' });
//       }

//             // if Pro US based to required submit TIN doc
//  if (!isUSBased && !req?.files?.w8BenUrl?.path && !req?.files?.w8BenEUrl?.path) {
     
//       return res.status(400).json({
//         status: 400,
//         message: "W-8BEN or W-8BEN-E is required for Non-US Pros",
//       });
//     }

//     const w8Ben = await cloudinary.uploader.upload(
//       req?.files?.w8BenUrl?.path,
//       { quality: 20, allowed_formats: ["jpg", "jpeg", "png", "jfif", "avif"] }
//     );

//     req.body.w8BenUrl = w8Ben.url;

//      const w8BenE = await cloudinary.uploader.upload(
//       req?.files?.w8BenEUrl?.path,
//       { quality: 20, allowed_formats: ["jpg", "jpeg", "png", "jfif", "avif"] }
//     );

//     req.body.w8BenEUrl = w8BenE.url;

//     //    documents: {
//     //   certificate: Joi.string(),
//     //   portfolioLink: Joi.string(),
//     //   platformLinks:Joi.array(),
//     //   governmentId: Joi.string(),
//     // },
//     const proCategory = await updateDocument(
//       "proCategory",
//       { proId: professionalId },
//       {
//         ...req.body,
//         documents: {
//           ...req.body,
//         },
//       }
//     );
//     console.log(proCategory, "proCategory");

//     return res.status(200).send({
//       status: 200,
//       data: { proCategory },
//     });
  
//   } catch (e) {
//     console.log(e, "eeee");

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

// Schema validation (optional)
const schema = Joi.object({
  professionalId: Joi.string().required(),
  paymentStatus: Joi.string(),
  certificate: Joi.string(),
  portfolioLink: Joi.string(),
  platformLinks: Joi.array(),
  governmentId: Joi.string(),
   isCompany: Joi.boolean(),
  isUSBased: Joi.boolean(),
  w8BenUrl: Joi.string().when("isUSBased", { is: false, then: Joi.required() }),
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
    const {
      professionalId,
      paymentStatus,
      certificate,
      portfolioLink,
      governmentId,
      platformLinks,
      isCompany,
      isUSBased,
      governmentIdUrl,
      ratingsUrls,
      certificates,
      insuranceUrl,
      companyRegistrationUrl,
      tinUrl,
      w8BenUrl,
      w8BenEUrl,
    } = req.body;


    const pro = await findOne("user", {
      _id: professionalId,
      userType: "pro",
    });
console.log("1");

    if (!pro) {
      return res.status(400).send({
        status: 400,
        message: "No Professional found",
      });
    }
console.log("2");
    // Explicit file uploads
    if (req?.files?.certificate?.path) {
      const uploaded = await uploadFile(req.files.certificate);
      req.body.certificate = uploaded.url;
    }
console.log("3");
    if (req?.files?.governmentId?.path) {
      const uploaded = await uploadFile(req.files.governmentId);
      req.body.governmentId = uploaded.url;
    }
console.log("4");
    if (req?.files?.companyRegistrationUrl?.path) {
      const uploaded = await uploadFile(req.files.companyRegistrationUrl);
      req.body.companyRegistrationUrl = uploaded.url;
    }
console.log("5");
    if (req?.files?.tinUrl?.path) {
      const uploaded = await uploadFile(req.files.tinUrl);
      req.body.tinUrl = uploaded.url;
    }
console.log("6");
    if (req?.files?.w8BenUrl?.path) {
      const uploaded = await uploadFile(req.files.w8BenUrl);
      req.body.w8BenUrl = uploaded.url;
    }
console.log("7");
    if (req?.files?.w8BenEUrl?.path) {
      const uploaded = await uploadFile(req.files.w8BenEUrl);
      req.body.w8BenEUrl = uploaded.url;
    }
console.log("8");
    // Required checks
    if (!req.body.governmentId) {
      return res.status(400).json({ status: 400, message: "Government ID is required" });
    }
console.log("9");
    if (isCompany && !req.body.companyRegistrationUrl) {
      return res.status(400).json({ status: 400, message: "Company Registration is required for companies" });
    }
console.log("10");
    if (isUSBased && !req.body.tinUrl) {
      return res.status(400).json({ status: 400, message: "TIN is required for US-based Pros" });
    }
console.log("11");
    if (isUSBased && isCompany && !req.body.w8BenUrl) {
      return res.status(400).json({ status: 400, message: "W-8BEN is required for Non-US Pros" });
    }
console.log("12");
    if (isUSBased === false && isCompany  && !req.body.w8BenEUrl) {
      return res.status(400).json({ status: 400, message: "W-8BEN-E is required for Non-US Companies" });
    }
console.log("3");
    // Save to DB
    const updated = await updateDocument(
      "proCategory",
      { proId: professionalId },
      {
        ...req.body,
        documents: { ...req.body },
      }
    );
console.log("14");
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
