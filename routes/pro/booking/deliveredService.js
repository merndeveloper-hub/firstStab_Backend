import Joi from "joi";
import { findOne, updateDocument } from "../../../helpers/index.js";
import { convertToUTC, extractDate, extractTime } from "../../../utils/index.js";
import { v2 as cloudinary } from "cloudinary";

// Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.cloud_name,
  api_key: process.env.api_key,
  api_secret: process.env.api_secret,
  secure: true,
  //upload_prefix: "https://api.cloudinary.com",
  chunk_size: 6000000,
});

const schema = Joi.object().keys({
  id: Joi.string().hex().length(24).required(),
});

const schemaBody = Joi.object().keys({
  serviceImage: Joi.array().optional().allow(""),
  FinishedTime: Joi.string().required(), // HH:mm:ss
  FinishedDate: Joi.string().required(), // YYYY-MM-DD
  timezone: Joi.string().required(), // ✅ Professional's timezone
  deliveryNotes: Joi.string().optional().allow(""),
});

// ✅ Helper function for parallel media uploads
const uploadMediaFiles = async (files) => {
  const allowedImageTypes = ["image/jpeg", "image/png", "image/webp", "image/jfif"];
  const allowedVideoTypes = ["video/mp4", "video/quicktime", "video/webm"];
  const maxImageSizeMB = 5;
  const maxVideoSizeMB = 10;

  const mediaFiles = Array.isArray(files) ? files : [files];

  if (mediaFiles.length > 6) {
    throw new Error("Maximum 6 files allowed.");
  }

  // Pre-validate all files
  for (const file of mediaFiles) {
    const fileSizeMB = file.size / (1024 * 1024);
    const isImage = allowedImageTypes.includes(file.type);
    const isVideo = allowedVideoTypes.includes(file.type);

    if (!isImage && !isVideo) {
      throw new Error("Only image and video files are allowed.");
    }

    if (isImage && fileSizeMB > maxImageSizeMB) {
      throw new Error("Image size should not exceed 5MB.");
    }

    if (isVideo && fileSizeMB > maxVideoSizeMB) {
      throw new Error("Video size should not exceed 10MB.");
    }
  }

  // Upload all files in parallel
  const uploadPromises = mediaFiles.map(async (file) => {
    const isImage = allowedImageTypes.includes(file.type);
    const isVideo = allowedVideoTypes.includes(file.type);

    const uploadOptions = {
      resource_type: isVideo ? "video" : "image",
      folder: "booking-media/delivered",
      use_filename: true,
      unique_filename: true, // Avoid conflicts
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

  const uploadedFiles = await Promise.all(uploadPromises);
  return uploadedFiles;
};

const deliveredBooking = async (req, res) => {
  try {
    await schema.validateAsync(req.params);
    await schemaBody.validateAsync(req.body);

    const { id } = req.params;
    const { FinishedTime, FinishedDate, timezone, deliveryNotes } = req.body;

    console.log("📦 Delivered Request:", { id, FinishedDate, FinishedTime, timezone });

    // ========== FIND BOOKING ==========
    const goingbooking = await findOne("proBookingService", { _id: id });

    if (!goingbooking) {
      return res.status(400).json({ status: 400, message: "No Booking Found!" });
    }

    // Check if already delivered
    if (goingbooking.status === "Delivered") {
      return res.status(400).json({
        status: 400,
        message: "Booking has already been delivered",
      });
    }

    // Check if already completed
    if (goingbooking.status === "Completed") {
      return res.status(400).json({
        status: 400,
        message: "Booking is already completed",
      });
    }

    // Check if cancelled
    if (goingbooking.status === "Cancelled") {
      return res.status(400).json({
        status: 400,
        message: "Cannot deliver a cancelled booking",
      });
    }

    // ========== VALIDATE AND CONVERT DELIVERY TIME TO UTC ==========
    const validatedFinishDate = extractDate(FinishedDate);
    const validatedFinishTime = extractTime(FinishedTime);

    if (!validatedFinishDate || !validatedFinishTime) {
      return res.status(400).json({
        status: 400,
        message: "Invalid finish date or time format",
      });
    }

    // Convert pro's delivery time to UTC
    const utcDelivery = convertToUTC(validatedFinishDate, validatedFinishTime, timezone);
    if (!utcDelivery) {
      return res.status(400).json({
        status: 400,
        message: "Failed to convert delivery time to UTC",
      });
    }

    console.log("🕒 Delivery Time Conversion:", {
      proTimezone: timezone,
      proDateTime: `${validatedFinishDate} ${validatedFinishTime}`,
      utcDateTime: `${utcDelivery.utcDate} ${utcDelivery.utcTime}`,
    });

    // ========== UPLOAD SERVICE IMAGES ==========
    let uploadedFiles = [];
    if (req?.files?.serviceImage) {
      try {
        uploadedFiles = await uploadMediaFiles(req.files.serviceImage);
        console.log(`✅ Uploaded ${uploadedFiles.length} files`);
      } catch (error) {
        return res.status(500).json({
          status: 500,
          message: "File upload failed: " + error.message,
        });
      }
    }

    // ========== PREPARE UPDATE DATA ==========
    const updateData = {
      status: "Delivered",
      deliveryStatus: "Delivered",
      serviceImage: uploadedFiles.length > 0 ? uploadedFiles : undefined,
      FinishedTime: utcDelivery.utcTime, // ✅ Store in UTC
      FinishedDate: utcDelivery.utcDate, // ✅ Store in UTC
      deliveryTimezone: timezone, // ✅ Store pro's timezone
      deliveryNotes: deliveryNotes || "Service delivered by professional",
      deliveredAt: new Date().toISOString(),
    };

    // If booking was rescheduled, mark reschedule as delivered
    if (goingbooking.orderRescheduleStatus && goingbooking.orderRescheduleStatus !== "NA") {
      updateData.orderRescheduleStatus = "Delivered";
    }

    // ========== UPDATE PRO BOOKING ==========
    const updatedBooking = await updateDocument(
      "proBookingService",
      { _id: id },
      updateData
    );

    if (!updatedBooking) {
      return res.status(400).json({
        status: 400,
        message: "Failed to update pro booking",
      });
    }

    // ========== UPDATE USER BOOKING ==========
    const updatedUserBooking = await updateDocument(
      "userBookServ",
      { _id: updatedBooking.bookServiceId },
      updateData
    );

    if (!updatedUserBooking) {
      return res.status(400).json({
        status: 400,
        message: "Failed to update user booking",
      });
    }

    console.log("✅ Booking Delivered Successfully");

    // ========== SEND NOTIFICATION (Optional) ==========
    // You can add notification logic here
    // sendNotification(goingbooking.userId, "Your service has been delivered");

    return res.status(200).json({
      status: 200,
      message:
        goingbooking.orderRescheduleStatus === "NA"
          ? "Service delivered successfully by professional"
          : "Rescheduled service delivered successfully by professional",
      // data: {
      //   bookingId: id,
      //   userBookingId: updatedBooking.bookServiceId,
      //   deliveryDate: utcDelivery.utcDate,
      //   deliveryTime: utcDelivery.utcTime,
      //   timezone: timezone,
      //   serviceImages: uploadedFiles,
      //   wasRescheduled: goingbooking.orderRescheduleStatus !== "NA",
      // },
      deliveredBooking: updatedBooking,
    });
  } catch (e) {
    console.error("❌ Delivered Booking Error:", e);
    return res.status(400).json({ status: 400, message: e.message });
  }
};

export default deliveredBooking;