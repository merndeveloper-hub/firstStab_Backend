import Joi from "joi";
import {
  findOne,
  updateDocument,
} from "../../../helpers/index.js";
import { v2 as cloudinary } from "cloudinary";


cloudinary.config({
  cloud_name: process.env.cloud_name,
  api_key: process.env.api_key,
  api_secret: process.env.api_secret,
});

const schema = Joi.object().keys({
  id: Joi.string().required(),
});


const schemaBody = Joi.object().keys({
  serviceImage: Joi.array().allow("").optional(),
});


//serviceImage
const resheduleDeliveredBooking = async (req, res) => {
  try {
   
    
    await schema.validateAsync(req.params);
    await schemaBody.validateAsync(req.body);
    const { id } = req.params;
    const goingbooking = await findOne("proBookingService", { _id: id });

    if (!goingbooking || goingbooking.length == 0) {
      return res
        .status(400)
        .json({ status: 400, message: "No Booking Found!" });
    }



 let uploadedFiles = [];

    if (req?.files?.serviceImage) {
      const allowedImageTypes = ["image/jpeg", "image/png", "image/webp","image/jfif"];
      const allowedVideoTypes = ["video/mp4", "video/quicktime", "video/webm"];
      const maxImageSizeMB = 2;
      const maxVideoSizeMB = 5;
    
      const mediaFiles = Array.isArray(req.files.serviceImage)
        ? req.files.serviceImage
        : [req.files.serviceImage];
    
      if (mediaFiles.length > 6) {
        return res.status(400).json({ message: "Maximum 6 files allowed." });
      }
    
   
   
      
      for (const file of mediaFiles) {
     
        const fileSizeMB = file.size / (1024 * 1024);
        const isImage = allowedImageTypes.includes(file.type);
        const isVideo = allowedVideoTypes.includes(file.type);
    
        if (!isImage && !isVideo) {
          return res.status(400).json({ message: "Only image and video files are allowed." });
        }
    
        if (isImage && fileSizeMB > maxImageSizeMB) {
          return res.status(400).json({ message: "Image size should not exceed 2MB." });
        }
    
        if (isVideo && fileSizeMB > maxVideoSizeMB) {
          return res.status(400).json({ message: "Video size should not exceed 5MB." });
        }
    
        const uploadOptions = {
          resource_type: isVideo ? "video" : "image",
          folder: "booking-media",
          use_filename: true,
          unique_filename: false,
          overwrite: false,
          transformation: isImage
            ? [{ quality: "auto:low", fetch_format: "auto" }]
            : [{ quality: "auto:eco", width: 720, crop: "limit" }],
        };
    
        const cloudObj = await cloudinary.uploader.upload(file.path, uploadOptions);
    
        uploadedFiles.push(cloudObj.url);
      }
    
      req.body.serviceImage = uploadedFiles; // Keep this as images or change key name if needed
    }

    const deliveredBooking = await updateDocument(
      "proBookingService",
      { _id: id },
      { status: "Delivered",  orderRescheduleStatus: "Delivered", serviceImage: uploadedFiles ?  uploadedFiles : undefined, }
    );

    
    if (!deliveredBooking || deliveredBooking.length == 0) {
      return res
      .status(400)
      .json({ status: 400, message: "No Booking Found!" });
    }
    
   
    
    const deliveredRandomProBooking = await updateDocument(
      "userBookServ",
      { _id: deliveredBooking.bookServiceId },
      { status: "Delivered",orderRescheduleStatus: "Delivered", serviceImage: uploadedFiles ?  uploadedFiles : undefined, }
    );

    
    
    return res
      .status(200)
      .json({
        status: 200,
        message: "Delivered Reshedule Service By Professional",
        deliveredBooking,
      });
  } catch (e) {
    console.log(e);
    return res.status(400).json({ status: 400, message: e.message });
  }
};

export default resheduleDeliveredBooking;
