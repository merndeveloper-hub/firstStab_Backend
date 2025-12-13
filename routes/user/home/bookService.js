import Joi from "joi";
import {
  findOne,
  insertNewDocument,
  find,
  getAggregate,
} from "../../../helpers/index.js";
import {
  generateUniqueNumber,
  convertToUTC,
  extractDate,
  extractTime,
  hasTimeConflict,
} from "../../../utils/index.js";
import { v2 as cloudinary } from "cloudinary";
import mongoose from "mongoose";
import send_email from "../../../lib/node-mailer/index.js";

cloudinary.config({
  cloud_name: process.env.cloud_name,
  api_key: process.env.api_key,
  api_secret: process.env.api_secret,
  secure: true,
  //upload_prefix: "https://api.cloudinary.com",
  chunk_size: 6000000,
});

const schema = Joi.object({
  userId: Joi.string().hex().length(24).required(),
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
  timezone: Joi.string(), // ✅ Make timezone required
  subCategories: Joi.object({
    id: Joi.string().hex().length(24).required(),
    serviceType: Joi.string().required(),
    orderStartDate: Joi.string().required(),
    orderEndDate: Joi.string().optional().allow("", null),
    orderStartTime: Joi.string().required(),
    orderEndTime: Joi.string().optional().allow("", null),
  }),
});

const bookService = async (req, res) => {
  try {
    console.log("📥 Booking Request:", req.body);
    await schema.validateAsync(req.body);

    const {
      timezone,
      userId,
      categoryId,
      professionalId,
      problemDescription,
      complexity_tier,
      price_model,
      fixed_price,
      min_price,
      max_price,
      range_price,
    } = req.body;

    // ========== VALIDATIONS ==========
    const findUser = await findOne("user", { _id: userId });
    if (!findUser) {
      return res.status(400).json({ status: 400, message: "User Not Found" });
    }

    const findCategorie = await findOne("category", { _id: categoryId });
    if (!findCategorie) {
      return res.status(400).json({ status: 400, message: "Category Not Found" });
    }

    const findSubCategorie = await findOne("subCategory", {
      _id: req.body.subCategories.id,
      [req.body.subCategories.serviceType]: true,
    });

    if (!findSubCategorie) {
      return res.status(400).json({ status: 400, message: "Sub Category Not Found" });
    }

    // Price validation
    if (price_model === "fixed" && findSubCategorie?.price_model === "fixed") {
      const getFixedPrice = Number(findSubCategorie?.fixed_price) == fixed_price;
      if (!getFixedPrice) {
        return res.status(400).json({
          status: 400,
          message: `The fixed price for this service is ${Number(findSubCategorie?.fixed_price)}`,
        });
      }
    }

    if (price_model === "range" && findSubCategorie?.price_model === "range") {
      const minPrice = Number(findSubCategorie?.min_price);
      const maxPrice = Number(findSubCategorie?.max_price);
      const price = Number(range_price);

      if (price < minPrice) {
        return res.status(400).json({
          status: 400,
          message: `The price must be at least ${minPrice}`,
        });
      }

      if (price > maxPrice) {
        return res.status(400).json({
          status: 400,
          message: `The price must not exceed ${maxPrice}`,
        });
      }
    }

    // Address validation for in-person service
    if (req.body.addressId) {
      const addressId = await findOne("address", { _id: req.body.addressId });
      if (!addressId) {
        return res.status(400).json({ status: 400, message: "No Address Found" });
      }
    }

    // ========== MEDIA UPLOAD ==========
    let uploadedFiles = [];

    if (req?.files?.media) {
      const allowedImageTypes = ["image/jpeg", "image/png", "image/webp"];
      const allowedVideoTypes = ["video/mp4", "video/quicktime", "video/webm"];
      const maxImageSizeMB = 5;
      const maxVideoSizeMB = 10;

      const mediaFiles = Array.isArray(req.files.media) ? req.files.media : [req.files.media];

      if (mediaFiles.length > 6) {
        return res.status(400).json({ message: "Maximum 6 files allowed." });
      }

      // Pre-validate
      for (const file of mediaFiles) {
        const fileSizeMB = file.size / (1024 * 1024);
        const isImage = allowedImageTypes.includes(file.type);
        const isVideo = allowedVideoTypes.includes(file.type);

        if (!isImage && !isVideo) {
          return res.status(400).json({ message: "Only image and video files are allowed." });
        }

        if (isImage && fileSizeMB > maxImageSizeMB) {
          return res.status(400).json({ message: "Image size should not exceed 5MB." });
        }

        if (isVideo && fileSizeMB > maxVideoSizeMB) {
          return res.status(400).json({ message: "Video size should not exceed 10MB." });
        }
      }

      // Parallel upload
      const uploadPromises = mediaFiles.map(async (file) => {
        const isVideo = allowedVideoTypes.includes(file.type);
        const isImage = allowedImageTypes.includes(file.type);

        const uploadOptions = {
          resource_type: isVideo ? "video" : "image",
          folder: "booking-media",
          use_filename: true,
          unique_filename: true,
          overwrite: false,
          transformation: isImage
            ? [{ quality: "auto:low", fetch_format: "auto", width: 1200, crop: "limit" }]
            : [{ quality: "auto:eco", width: 720, crop: "limit", video_codec: "auto" }],
          timeout: 60000,
        };

        try {
          const cloudObj = await cloudinary.uploader.upload(file.path, uploadOptions);
          return cloudObj.secure_url;
        } catch (error) {
          console.error(`Upload failed for file ${file.name}:`, error);
          throw new Error(`Failed to upload ${file.name}`);
        }
      });

      try {
        uploadedFiles = await Promise.all(uploadPromises);
        req.body.images = uploadedFiles;
      } catch (error) {
        return res.status(500).json({
          status: 500,
          message: "File upload failed. Please try again.",
          error: error.message,
        });
      }
    }

    // ========== TIMEZONE CONVERSION ==========
    // Validate dates and times
    const startDate = extractDate(req.body.subCategories.orderStartDate);
    const startTime = extractTime(req.body.subCategories.orderStartTime);
    
    if (!startDate || !startTime) {
      return res.status(400).json({
        status: 400,
        message: "Invalid start date or time format",
      });
    }

    // Convert user's local time to UTC for storage
    const utcStart = convertToUTC(startDate, startTime, timezone);
    if (!utcStart) {
      return res.status(400).json({
        status: 400,
        message: "Failed to convert start date/time to UTC",
      });
    }

    let utcEnd = null;
    if (req.body.subCategories.orderEndDate && req.body.subCategories.orderEndTime) {
      const endDate = extractDate(req.body.subCategories.orderEndDate);
      const endTime = extractTime(req.body.subCategories.orderEndTime);
      
      if (endDate && endTime) {
        utcEnd = convertToUTC(endDate, endTime, timezone);
      }
    }

    console.log("🕒 Time Conversion:", {
      timezone: timezone,
      userDateTime: `${startDate} ${startTime}`,
      utcDateTime: `${utcStart.utcDate} ${utcStart.utcTime}`,
    });

    // ========== CHECK EXISTING BOOKINGS (in UTC) ==========
    const timeHHMM = utcStart.utcTime.slice(0, 5);
    const alreadyBook = await find("proBookingService", {
      professsionalId: professionalId,
      orderStartDate: utcStart.utcDate,
      serviceType: { $in: ["isChat", "isVirtual", "isInPerson"] },
      orderStartTime: { $regex: `^${timeHHMM}` },
    });

    if (alreadyBook.length > 0) {
      return res.status(400).json({
        status: 400,
        message: "Pro already has a booking at this time.",
      });
    }

    // ========== GENERATE IDs ==========
    const genrateRequestID = generateUniqueNumber();
    let inPersonOTP;
    if (req.body.subCategories.serviceType === "isInPerson") {
      inPersonOTP = generateUniqueNumber();
    }

    // ========== PROFESSIONAL VALIDATION ==========
    let findprofessionalId;
    if (professionalId) {
      findprofessionalId = await findOne("user", { _id: professionalId });
      if (!findprofessionalId) {
        return res.status(400).json({ status: 400, message: "No service provider found" });
      }
    }

    // ========== CREATE USER BOOKING (Store in UTC) ==========
    const bookServ = await insertNewDocument("userBookServ", {
      ...req.body,
      media: uploadedFiles.length > 0 ? uploadedFiles : undefined,
      inPersonOTP: inPersonOTP || undefined,
      requestId: genrateRequestID,
      serviceName: findCategorie.name,
      typeOfWork: findSubCategorie.name,
      serviceAssign: professionalId ? "Professional" : "Random",
      timezone: timezone, // ✅ Store user's timezone
      subCategories: {
        id: req.body.subCategories.id,
        serviceType: req.body.subCategories.serviceType,
        orderStartDate: utcStart.utcDate, // ✅ Store in UTC
        orderStartTime: utcStart.utcTime, // ✅ Store in UTC
        orderEndDate: utcEnd ? utcEnd.utcDate : null,
        orderEndTime: utcEnd ? utcEnd.utcTime : null,
      },
    });

    if (!bookServ) {
      return res.status(400).json({
        status: 400,
        message: "Book Service not created successfully",
      });
    }

    // ========== CREATE PRO BOOKING ==========
    let probookService;

    if (bookServ && !findprofessionalId) {
      // Random professional assignment
      const getProCategory = await getAggregate("proCategory", [
        {
          $match: {
            categoryId: new mongoose.Types.ObjectId(categoryId),
            status: "Active",
            "subCategories.id": new mongoose.Types.ObjectId(req.body.subCategories.id),
          },
        },
        { $unwind: "$subCategories" },
        {
          $match: {
            "subCategories.id": new mongoose.Types.ObjectId(req.body.subCategories.id),
            [`subCategories.${req.body.subCategories.serviceType}`]: true,
          },
        },
        { $project: { _id: 1, proId: 1 } },
      ]);

      if (!getProCategory || getProCategory.length === 0) {
        probookService = await insertNewDocument("proBookingService", {
          ...req.body,
          inPersonOTP: inPersonOTP || undefined,
          media: uploadedFiles.length > 0 ? uploadedFiles : undefined,
          professsionalId: null,
          bookServiceId: bookServ._id,
          categoryId: req.body.categoryId,
          subCategoryId: req.body.subCategories.id,
          requestId: genrateRequestID,
          serviceType: req.body.subCategories.serviceType,
          serviceName: findCategorie.name,
          typeOfWork: findSubCategorie.name,
          problemDescription: problemDescription,
          timezone: timezone, // ✅ Store user's timezone
          orderStartDate: utcStart.utcDate, // ✅ UTC
          orderStartTime: utcStart.utcTime, // ✅ UTC
          orderEndDate: utcEnd ? utcEnd.utcDate : null,
          orderEndTime: utcEnd ? utcEnd.utcTime : null,
          status: "Pending",
        });
      } else {
        for (const doc of getProCategory) {
          probookService = await insertNewDocument("proBookingService", {
            ...req.body,
            inPersonOTP: inPersonOTP || undefined,
            media: uploadedFiles.length > 0 ? uploadedFiles : undefined,
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
            timezone: timezone, // ✅ Store user's timezone
            orderStartDate: utcStart.utcDate, // ✅ UTC
            orderStartTime: utcStart.utcTime, // ✅ UTC
            orderEndDate: utcEnd ? utcEnd.utcDate : null,
            orderEndTime: utcEnd ? utcEnd.utcTime : null,
            status: "Pending",
          });
        }
      }
    } else {
      // Specific professional assignment
      const getProCategory = await getAggregate("proCategory", [
        {
          $match: {
            proId: new mongoose.Types.ObjectId(professionalId),
            categoryId: new mongoose.Types.ObjectId(categoryId),
            status: "Active",
            subCategories: {
              $elemMatch: {
                id: new mongoose.Types.ObjectId(req.body.subCategories.id),
              },
            },
          },
        },
        { $unwind: "$subCategories" },
        {
          $match: {
            "subCategories.id": new mongoose.Types.ObjectId(req.body.subCategories.id),
            [`subCategories.${req.body.subCategories.serviceType}`]: true,
          },
        },
        { $project: { _id: 1, proId: 1 } },
      ]);

      if (!getProCategory || getProCategory.length === 0) {
        return res.status(400).json({
          status: 400,
          message: `The Professional ${findprofessionalId.first_Name} ${findprofessionalId.last_Name} not available for the selected service. Kindly select other professional.`,
        });
      }

      probookService = await insertNewDocument("proBookingService", {
        ...req.body,
        media: uploadedFiles.length > 0 ? uploadedFiles : undefined,
        proServiceId: getProCategory[0]._id,
        professsionalId: findprofessionalId,
        bookServiceId: bookServ._id,
        categoryId: req.body.categoryId,
        subCategoryId: req.body.subCategories.id,
        inPersonOTP: inPersonOTP || undefined,
        requestId: genrateRequestID,
        serviceAssign: "Professional",
        serviceType: req.body.subCategories.serviceType,
        serviceName: findCategorie.name,
        typeOfWork: findSubCategorie.name,
        problemDescription: problemDescription,
        timezone: timezone, // ✅ Store user's timezone
        orderStartDate: utcStart.utcDate, // ✅ UTC
        orderStartTime: utcStart.utcTime, // ✅ UTC
        orderEndDate: utcEnd ? utcEnd.utcDate : null,
        orderEndTime: utcEnd ? utcEnd.utcTime : null,
        status: "Pending",
      });
    }

    let proBookServiceId = probookService?._id;

    // 📧 Send booking confirmation email to USER
await send_email(
  "userBookingCreated",
  {
    userName: findUser?.first_Name || findUser?.email,
    requestId: genrateRequestID,
    serviceName: findSubCategorie.name,
    serviceType: bookServ.subCategories.serviceType || req.body.subCategories.serviceType.replace('is', ''),
    bookingDate: bookServ.subCategories.orderStartDate,
    bookingTime: bookServ.subCategories.orderStartTime,
    // servicePrice: servicePrice,
    // platformFee: platformFee,
    // totalAmount: totalAmount
  },
  process.env.SENDER_EMAIL,
  "Booking Created - Complete Payment to Confirm",
  findUser?.email
);

    return res.status(201).json({
      status: 201,
      message: "Book Service successfully",
      bookServ,
      proBookServiceId,
    });
  } catch (e) {
    console.error("❌ Booking Error:", e);
    return res.status(400).json({ status: 400, message: e.message });
  }
};

export default bookService;