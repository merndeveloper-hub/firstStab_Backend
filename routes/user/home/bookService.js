import Joi from "joi";
import {
  findOne,
  insertNewDocument,
  find,
  getAggregate,
} from "../../../helpers/index.js";
import {
  generateUniqueNumber,
  extractDate,
  extractTime,
} from "../../../utils/index.js";
import { v2 as cloudinary } from "cloudinary";
import mongoose from "mongoose";
//import { getSocket } from '../../../socket.js';

// cloudinary.config({
//   cloud_name: "dwebxmktr",
//   api_key: "988681166781262",
//   api_secret: "f4gUgqo7htBtD3eOGhfirdKd8kA",
// });

// Additional optimization: Configure cloudinary with better defaults
cloudinary.config({
  cloud_name: "dwebxmktr",
  api_key: "988681166781262",
  api_secret: "f4gUgqo7htBtD3eOGhfirdKd8kA",
  // Performance optimizations
  secure: true,
  upload_prefix: "https://api.cloudinary.com",
  chunk_size: 6000000, // 6MB chunks for better upload speed
});

const schema = Joi.object({
  userId: Joi.string().hex().length(24).required(), // Must be a valid MongoDB ObjectId
  addressId: Joi.string().hex().length(24),
  media: Joi.array().allow("").optional(),
  professionalId: Joi.string().allow("").optional(),
  proServiceId: Joi.string().allow("").optional(),
  problemDescription: Joi.string().required(),
  categoryId: Joi.string().hex().length(24).required(),
  complexity_tier: Joi.string().allow("").optional(),
  price_model: Joi.string().allow("").optional(),
  fixed_price: Joi.string().allow("").optional(),
  min_price: Joi.string().allow("").optional(),
  max_price: Joi.string().allow("").optional(),
  range_price: Joi.string().allow("").optional(),
  subCategories: Joi.object({
    id: Joi.string().hex().length(24).required(),
    serviceType: Joi.string().required(),
    orderStartDate: Joi.string().required().messages({
      "string.pattern.base": "orderStart Date is required",
      "any.required": "orderStart Date is required.",
    }),
    orderEndDate: Joi.string().messages({
      "string.pattern.base": "order  EndDate is required",
      "any.required": "order  EndDate is required.",
    }),
    orderStartTime: Joi.string().required().messages({
      "string.pattern.base": "orderStart Time is required",
      "any.required": "orderStart Time is required.",
    }),
    orderEndTime: Joi.string().messages({
      "string.pattern.base": "orderEnd Time is required",
      "any.required": "orderEnd Time is required.",
    }),
  }),
});

const bookService = async (req, res) => {
  try {
    console.log(req.body, "body");
    await schema.validateAsync(req.body);

    const {
      userId,
      categoryId,
      professionalId,
      problemDescription,
      image,
      media,
      complexity_tier,
      price_model,
      fixed_price,
      min_price,
      max_price,
      range_price,
    } = req.body;
    console.log(req.body, "body");

    const findUser = await findOne("user", { _id: userId });
    if (!findUser || findUser.length == 0) {
      return res.status(400).json({ status: 400, message: "User Not Found" });
    }

    const findCategorie = await findOne("category", { _id: categoryId });
    if (!findCategorie || findCategorie.length == 0) {
      return res
        .status(400)
        .json({ status: 400, message: "Category Not Found" });
    }
    console.log(findCategorie, "findCategorie");

    const findSubCategorie = await findOne("subCategory", {
      _id: req.body.subCategories.id,
      [req.body.subCategories.serviceType]: true, // Dynamically check serviceType key
    });

    console.log(findSubCategorie, "findSubCategorie");

    if (!findSubCategorie || findSubCategorie.length == 0) {
      return res
        .status(400)
        .json({ status: 400, message: "Sub Category Not Found" });
    }

      if (price_model == "fixed" && findSubCategorie?.price_model == "fixed") {
      let getFixedPrice = Number(findSubCategorie?.fixed_price) == fixed_price;
      if (!getFixedPrice) {
        return res.status(400).json({
          status: 400,
          message: `The fixed price for this service is ${Number(
            findSubCategorie?.fixed_price
          )}`,
        });
      }
    }

console.log(findSubCategorie?.price_model,"findSubCategorie?.price_model");

    if (price_model == "range" && findSubCategorie?.price_model == "range") {
      console.log("range");
      
    const minPrice = Number(findSubCategorie?.min_price);
const maxPrice = Number(findSubCategorie?.max_price);
const price = Number(range_price);

console.log(price, "requested price");
console.log(minPrice, "subcategory min_price");
console.log(maxPrice, "subcategory max_price");

// Check lower bound
if (price < minPrice) {
  return res.status(400).json({
    status: 400,
    message: `The price must be at least ${minPrice}`,
  });
}

// Check upper bound
if (price > maxPrice) {
  return res.status(400).json({
    status: 400,
    message: `The price must not exceed ${maxPrice}`,
  });
}
    }

    //IsInPerson service Type in require user address
    if (req.body.addressId) {
      const addressId = await findOne("address", { _id: req.body.addressId });
      if (!addressId || addressId.length == 0) {
        return res
          .status(400)
          .json({ status: 400, message: "No Address Found" });
      }
    }

  

    // let uploadedFiles = [];

    // if (req?.files?.media) {
    //   const allowedImageTypes = ["image/jpeg", "image/png", "image/webp"];
    //   const allowedVideoTypes = ["video/mp4", "video/quicktime", "video/webm"];
    //   const maxImageSizeMB = 2;
    //   const maxVideoSizeMB = 5;

    //   const mediaFiles = Array.isArray(req.files.media)
    //     ? req.files.media
    //     : [req.files.media];

    //   if (mediaFiles.length > 6) {
    //     return res.status(400).json({ message: "Maximum 6 files allowed." });
    //   }

    //   for (const file of mediaFiles) {
    //     console.log("Uploaded file type:------------", file);
    //     const fileSizeMB = file.size / (1024 * 1024);
    //     const isImage = allowedImageTypes.includes(file.type);
    //     const isVideo = allowedVideoTypes.includes(file.type);

    //     if (!isImage && !isVideo) {
    //       return res
    //         .status(400)
    //         .json({ message: "Only image and video files are allowed." });
    //     }

    //     if (isImage && fileSizeMB > maxImageSizeMB) {
    //       return res
    //         .status(400)
    //         .json({ message: "Image size should not exceed 2MB." });
    //     }

    //     if (isVideo && fileSizeMB > maxVideoSizeMB) {
    //       return res
    //         .status(400)
    //         .json({ message: "Video size should not exceed 5MB." });
    //     }

    //     const uploadOptions = {
    //       resource_type: isVideo ? "video" : "image",
    //       folder: "booking-media",
    //       use_filename: true,
    //       unique_filename: false,
    //       overwrite: false,
    //       transformation: isImage
    //         ? [{ quality: "auto:low", fetch_format: "auto" }]
    //         : [{ quality: "auto:eco", width: 720, crop: "limit" }],
    //     };

    //     const cloudObj = await cloudinary.uploader.upload(
    //       file.path,
    //       uploadOptions
    //     );

    //     uploadedFiles.push(cloudObj.url);
    //   }

    //   req.body.images = uploadedFiles; // Keep this as images or change key name if needed
    // }

// Optimized media upload section - replace your existing upload code

let uploadedFiles = [];

if (req?.files?.media) {
  const allowedImageTypes = ["image/jpeg", "image/png", "image/webp"];
  const allowedVideoTypes = ["video/mp4", "video/quicktime", "video/webm"];
  const maxImageSizeMB = 5;
  const maxVideoSizeMB = 10;

  const mediaFiles = Array.isArray(req.files.media)
    ? req.files.media
    : [req.files.media];

  if (mediaFiles.length > 6) {
    return res.status(400).json({ message: "Maximum 6 files allowed." });
  }

  // Pre-validate all files before uploading
  for (const file of mediaFiles) {
    const fileSizeMB = file.size / (1024 * 1024);
    const isImage = allowedImageTypes.includes(file.type);
    const isVideo = allowedVideoTypes.includes(file.type);

    if (!isImage && !isVideo) {
      return res
        .status(400)
        .json({ message: "Only image and video files are allowed." });
    }

    if (isImage && fileSizeMB > maxImageSizeMB) {
      return res
        .status(400)
        .json({ message: "Image size should not exceed 2MB." });
    }

    if (isVideo && fileSizeMB > maxVideoSizeMB) {
      return res
        .status(400)
        .json({ message: "Video size should not exceed 5MB." });
    }
  }

  // Parallel upload with Promise.all for faster processing
  const uploadPromises = mediaFiles.map(async (file) => {
    const isVideo = allowedVideoTypes.includes(file.type);
    const isImage = allowedImageTypes.includes(file.type);

    const uploadOptions = {
      resource_type: isVideo ? "video" : "image",
      folder: "booking-media",
      use_filename: true,
      unique_filename: true, // Changed to true to avoid conflicts
      overwrite: false,
      // Optimized transformations
      transformation: isImage
        ? [
            { 
              quality: "auto:low", 
              fetch_format: "auto",
              width: 1200, // Max width limit
              crop: "limit" 
            }
          ]
        : [
            { 
              quality: "auto:eco", 
              width: 720, 
              crop: "limit",
              video_codec: "auto" // Auto codec selection
            }
          ],
      // Additional performance optimizations
      timeout: 60000, // 60 second timeout
    };

    try {
      const cloudObj = await cloudinary.uploader.upload(file.path, uploadOptions);
      return cloudObj.secure_url; // Use secure_url instead of url
    } catch (error) {
      console.error(`Upload failed for file ${file.name}:`, error);
      throw new Error(`Failed to upload ${file.name}`);
    }
  });

  try {
    // Upload all files in parallel
    uploadedFiles = await Promise.all(uploadPromises);
    req.body.images = uploadedFiles;
  } catch (error) {
    return res.status(500).json({ 
      status: 500, 
      message: "File upload failed. Please try again.",
      error: error.message 
    });
  }
}




    let extractedDate;
    let extractedTime;
    let extractedEndDate;
    let extractedEndTime;

    if (
      req.body.subCategories.orderStartDate ||
      req.body.subCategories.orderEndDate ||
      req.body.subCategories.orderStartTime ||
      req.body.subCategories.orderEndTime
    ) {
      console.log("IN DATE");

      extractedDate = extractDate(req.body.subCategories.orderStartDate);
      extractedEndDate = extractDate(req.body.subCategories.orderEndDate);
      extractedTime = extractTime(req.body.subCategories.orderStartTime);
      extractedEndTime = extractTime(req.body.subCategories.orderEndTime);
    }

    /// Already book A service ///
const timeHHMM = extractedTime.slice(0,5); // "05:06"
const alreadyBook = await find("proBookingService", {
  professsionalId:professionalId,
  orderStartDate: extractedDate,
  serviceType: { $in: ["isChat", "isVirtual", "isInPerson"] },
  orderStartTime: { $regex: `^${timeHHMM}` }   // starts with HH:MM
});



if (alreadyBook.length > 0) {
  return res.status(400).json({
    status: 400,
    message: "Pro already have a booking at this time."
  });
}
    //--------Generate RequestID-------------//
    const genrateRequestID = generateUniqueNumber();

    let inPersonOTP;
    //-------INPERSONOTP---------//
    if (req.body.subCategories.serviceType == "isInPerson") {
      inPersonOTP = generateUniqueNumber();
    }

    //------professionalId------//
    let findprofessionalId;
    if (professionalId) {
      findprofessionalId = await findOne("user", { _id: professionalId });

      if (!findprofessionalId || findprofessionalId.length == 0) {
        return res
          .status(400)
          .json({ status: 400, message: `No service provider found` });
      }
    }

    const bookServ = await insertNewDocument("userBookServ", {
      ...req.body,
      media: uploadedFiles ? uploadedFiles : undefined,
      inPersonOTP: inPersonOTP ? inPersonOTP : undefined,
      requestId: genrateRequestID,
      serviceName: findCategorie.name,
      typeOfWork: findSubCategorie.name,
      serviceAssign: professionalId ? "Professional" : "Random",
      subCategories: {
        id: req.body.subCategories.id,
        serviceType: req.body.subCategories.serviceType,
        orderStartDate: extractedDate,
        orderStartTime: extractedTime,
        orderEndDate: req.body.subCategories.orderEndDate
          ? extractedEndDate
          : null,
        orderEndTime: req.body.subCategories.orderEndTime
          ? extractedEndTime
          : null,
      },
    });

    if (!bookServ || bookServ.length == 0) {
      return res.status(400).json({
        status: 400,
        message: "Book Service not created successfully",
      });
    }
    console.log("checking", bookServ._id);
    let probookService;

    //----------------SEEN PRO DASHBOARD userBookServICE Random Professional--------
    if (bookServ && !findprofessionalId) {
      const categoryIds = findCategorie.map((cat) => cat._id); // Extract category IDs
      console.log(categoryIds, "categoryIds");

      const subCategoryIds = findSubCategorie.map((sub) => sub._id); // Extract subCategory IDs
      console.log(subCategoryIds, "subCategoryIds");

      const getProCategory = await getAggregate("proCategory", [
        {
          $match: {
            categoryId: new mongoose.Types.ObjectId(categoryId), // Match category ID
            status: "Active", // Add this line (2025/06/04)
            "subCategories.id": new mongoose.Types.ObjectId(
              req.body.subCategories.id
            ), // Match subCategory ID
          },
        },
        {
          $unwind: "$subCategories", // Unwind the subCategories array
        },
        {
          $match: {
            "subCategories.id": new mongoose.Types.ObjectId(
              req.body.subCategories.id
            ), // Match subCategory ID again
            [`subCategories.${req.body.subCategories.serviceType}`]: true, // Match the specified serviceType field
          },
        },
        {
          $project: {
            _id: 1, // Extract _id
            proId: 1, // Extract proId
          },
        },
        // {
        //   $match: {
        //     categoryId: new mongoose.Types.ObjectId(categoryId), // Match category ID
        //     "subCategories.id": new mongoose.Types.ObjectId(req.body.subCategories.id), // Match subCategory ID
        //   },
        // },
        // {
        //   $unwind: "$subCategories", // Unwind subCategories array
        // },
        // {
        //   $match: {
        //     "subCategories.id": new mongoose.Types.ObjectId(req.body.subCategories.id), // Match subCategory ID again after unwind
        //     [`subCategories.${req.body.subCategories.serviceType}`]: true, // Match the specified serviceType field
        //   },
        // },
        // {
        //   $project: {
        //     _id: 1, // Extract _id
        //     proId: 1, // Extract proId
        //   },
        // },
      ]);

      console.log(getProCategory, "getProCategory");
      if (!getProCategory || getProCategory.length == 0) {
        // No pro service found in this scenario
        console.log(bookServ, "insert");

        probookService = await insertNewDocument("proBookingService", {
          ...req.body,
          inPersonOTP: inPersonOTP ? inPersonOTP : undefined,
          proServiceId: getProCategory._id,
          media: uploadedFiles ? uploadedFiles : undefined,
          professsionalId: findprofessionalId,
          bookServiceId: bookServ._id,
          categoryId: req.body.categoryId,
          subCategoryId: req.body.subCategories.id,

          requestId: genrateRequestID,
          serviceType: req.body.subCategories.serviceType,
          serviceName: findCategorie.name,
          typeOfWork: findSubCategorie.name,
          problemDescription: problemDescription,
          orderStartDate: extractedDate,
          orderStartTime: extractedTime,
          orderEndDate: req.body.subCategories.orderEndDate
            ? extractedEndDate
            : null,
          orderEndTime: req.body.subCategories.orderEndTime
            ? extractedEndTime
            : null,
          status: "Pending",
        });
        // return res
        // .status(400)
        // .json({ status: 400, message: "Booking has been created successfully." });
      }
      for (const doc of getProCategory) {
        console.log(findSubCategorie._id, "findSubCategorie._id");
        probookService = await insertNewDocument("proBookingService", {
          ...req.body,
          inPersonOTP: inPersonOTP ? inPersonOTP : undefined,
          media: uploadedFiles ? uploadedFiles : undefined,
          proServiceId: doc._id,
          professsionalId: doc.proId,
          bookServiceId: bookServ._id,
          categoryId: req.body.categoryId,
          subCategoryId: req.body.subCategories.id,

          requestId: genrateRequestID,
          serviceType: req.body.subCategories.serviceType,
          serviceName: findCategorie.name,
          typeOfWork: findSubCategorie.name,
          problemDescription: problemDescription,
          orderStartDate: extractedDate,
          orderStartTime: extractedTime,
          orderEndDate: req.body.subCategories.orderEndDate
            ? extractedEndDate
            : null,
          orderEndTime: req.body.subCategories.orderEndTime
            ? extractedEndTime
            : null,
          status: "Pending",
        });
        console.log(probookService, "probok");
      }
      //}
    } else {
      const getProCategory = await getAggregate("proCategory", [
        {
          $match: {
            proId: new mongoose.Types.ObjectId(professionalId), // Match professional ID
            categoryId: new mongoose.Types.ObjectId(categoryId), // Match category ID
            status: "Active", // Add this line (2025/06/04)
            subCategories: {
              $elemMatch: {
                id: new mongoose.Types.ObjectId(req.body.subCategories.id), // Match subCategory ID
              },
            },
          },
        },
        {
          $unwind: "$subCategories", // Unwind subCategories array
        },
        {
          $match: {
            "subCategories.id": new mongoose.Types.ObjectId(
              req.body.subCategories.id
            ), // Match subCategory ID again after unwind
            [`subCategories.${req.body.subCategories.serviceType}`]: true, // Match the specified serviceType field
          },
        },
        {
          $project: {
            _id: 1, // Extract _id
            proId: 1, // Extract proId
          },
        },
      ]);

      if (!getProCategory || getProCategory.length == 0) {
        return res
          .status(400)
          .json({
            status: 400,
            message: `The Professional ${findprofessionalId.first_Name} ${findprofessionalId.last_Name} not available for the selected service.Kindly select other professional.`,
          });
      }

      console.log(getProCategory[0]._id, "in---------");

      probookService = await insertNewDocument("proBookingService", {
        ...req.body,
        media: uploadedFiles ? uploadedFiles : undefined,
        proServiceId: getProCategory[0]._id,
        professsionalId: findprofessionalId,
        bookServiceId: bookServ?._id,
        categoryId: req.body.categoryId,
        subCategoryId: req.body.subCategories.id,

        inPersonOTP: inPersonOTP ? inPersonOTP : undefined,
        requestId: genrateRequestID,
        serviceAssign: "Professional",
        serviceType: req.body.subCategories.serviceType,
        serviceName: findCategorie.name,
        typeOfWork: findSubCategorie.name,
        problemDescription: problemDescription,
        orderStartDate: extractedDate,
        orderStartTime: extractedTime,

        orderEndDate: req.body.subCategories.orderEndDate
          ? extractedEndDate
          : null,
        orderEndTime: req.body.subCategories.orderEndTime
          ? extractedEndTime
          : null,
        status: "Pending",
      });
    }
    //  const io = getSocket();
    // console.log(io,"io");

    //   io.emit('userBooking', {
    //     bookServ,
    //    /// proId,
    //    // bookingId,
    //     message: 'User has been requested for service',
    //   });

    let proBookServiceId = probookService?._id;
    return res
      .status(201)
      .json({
        status: 201,
        message: "Book Service successfully",
        bookServ,
        proBookServiceId,
      });
  } catch (e) {
    return res.status(400).json({ status: 400, message: e.message });
  }
};

export default bookService;
