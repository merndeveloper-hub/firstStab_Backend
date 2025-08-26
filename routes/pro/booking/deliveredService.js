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

// const schema = Joi.object().keys({
//   id: Joi.string().required(),
// });


// const schemaBody = Joi.object().keys({
//   serviceImage: Joi.array().allow("").optional(),
// });


// //serviceImage
// const deliveredBooking = async (req, res) => {
//   try {
   
    
//     await schema.validateAsync(req.params);
//     await schemaBody.validateAsync(req.body);
//     const { id } = req.params;
//     const goingbooking = await findOne("proBookingService", { _id: id });

//     if (!goingbooking || goingbooking.length == 0) {
//       return res
//         .status(400)
//         .json({ status: 400, message: "No Booking Found!" });
//     }

// if( goingbooking.orderRescheduleStatus == "NA"){



//  let uploadedFiles = [];

//     if (req?.files?.serviceImage) {
//       const allowedImageTypes = ["image/jpeg", "image/png", "image/webp","image/jfif"];
//       const allowedVideoTypes = ["video/mp4", "video/quicktime", "video/webm"];
//       const maxImageSizeMB = 2;
//       const maxVideoSizeMB = 5;
    
//       const mediaFiles = Array.isArray(req.files.serviceImage)
//         ? req.files.serviceImage
//         : [req.files.serviceImage];
    
//       if (mediaFiles.length > 6) {
//         return res.status(400).json({ message: "Maximum 6 files allowed." });
//       }
    
//    console.log(mediaFiles,"-----");
   
      
//       for (const file of mediaFiles) {
//         console.log("Uploaded file type:------------", file);
//         const fileSizeMB = file.size / (1024 * 1024);
//         const isImage = allowedImageTypes.includes(file.type);
//         const isVideo = allowedVideoTypes.includes(file.type);
    
//         if (!isImage && !isVideo) {
//           return res.status(400).json({ message: "Only image and video files are allowed." });
//         }
    
//         // if (isImage && fileSizeMB > maxImageSizeMB) {
//         //   return res.status(400).json({ message: "Image size should not exceed 2MB." });
//         // }
    
//         // if (isVideo && fileSizeMB > maxVideoSizeMB) {
//         //   return res.status(400).json({ message: "Video size should not exceed 5MB." });
//         // }
    
//         const uploadOptions = {
//           resource_type: isVideo ? "video" : "image",
//           folder: "booking-media",
//           use_filename: true,
//           unique_filename: false,
//           overwrite: false,
//           transformation: isImage
//             ? [{ quality: "auto:low", fetch_format: "auto" }]
//             : [{ quality: "auto:eco", width: 720, crop: "limit" }],
//         };
    
//         const cloudObj = await cloudinary.uploader.upload(file.path, uploadOptions);
    
//         uploadedFiles.push(cloudObj.url);
//       }
    
//       req.body.serviceImage = uploadedFiles; // Keep this as images or change key name if needed
//     }

//     const deliveredBooking = await updateDocument(
//       "proBookingService",
//       { _id: id },
//       { status: "Delivered", serviceImage: uploadedFiles ?  uploadedFiles : undefined, }
//     );

    
//     if (!deliveredBooking || deliveredBooking.length == 0) {
//       return res
//       .status(400)
//       .json({ status: 400, message: "No Booking Found!" });
//     }
    
//     console.log(deliveredBooking.bookServiceId,"deliveredBooking.bookServiceId");
    
//     const deliveredRandomProBooking = await updateDocument(
//       "userBookServ",
//       { _id: deliveredBooking.bookServiceId},
//       { status: "Delivered", serviceImage: uploadedFiles ?  uploadedFiles : undefined, }
//     );
//     console.log(deliveredRandomProBooking,"deliveredRandomProBooking");
    
    
//     return res
//       .status(200)
//       .json({
//         status: 200,
//         message: "Delivered Service By Professional",
//         deliveredBooking,
//       });

//     }
//     else {
//       const goingbooking = await findOne("proBookingService", { _id: id });

//       if (!goingbooking || goingbooking.length == 0) {
//         return res
//           .status(400)
//           .json({ status: 400, message: "No Booking Found!" });
//       }
  
  
  
//    let uploadedFiles = [];
  
//       if (req?.files?.serviceImage) {
//         const allowedImageTypes = ["image/jpeg", "image/png", "image/webp","image/jfif"];
//         const allowedVideoTypes = ["video/mp4", "video/quicktime", "video/webm"];
//         const maxImageSizeMB = 2;
//         const maxVideoSizeMB = 5;
      
//         const mediaFiles = Array.isArray(req.files.serviceImage)
//           ? req.files.serviceImage
//           : [req.files.serviceImage];
      
//         if (mediaFiles.length > 6) {
//           return res.status(400).json({ message: "Maximum 6 files allowed." });
//         }
      
//      console.log(mediaFiles,"-----");
     
        
//         for (const file of mediaFiles) {
//           console.log("Uploaded file type:------------", file);
//           const fileSizeMB = file.size / (1024 * 1024);
//           const isImage = allowedImageTypes.includes(file.type);
//           const isVideo = allowedVideoTypes.includes(file.type);
      
//           // if (!isImage && !isVideo) {
//           //   return res.status(400).json({ message: "Only image and video files are allowed." });
//           // }
      
//           // if (isImage && fileSizeMB > maxImageSizeMB) {
//           //   return res.status(400).json({ message: "Image size should not exceed 2MB." });
//           // }
      
//           if (isVideo && fileSizeMB > maxVideoSizeMB) {
//             return res.status(400).json({ message: "Video size should not exceed 5MB." });
//           }
      
//           const uploadOptions = {
//             resource_type: isVideo ? "video" : "image",
//             folder: "booking-media",
//             use_filename: true,
//             unique_filename: false,
//             overwrite: false,
//             transformation: isImage
//               ? [{ quality: "auto:low", fetch_format: "auto" }]
//               : [{ quality: "auto:eco", width: 720, crop: "limit" }],
//           };
      
//           const cloudObj = await cloudinary.uploader.upload(file.path, uploadOptions);
      
//           uploadedFiles.push(cloudObj.url);
//         }
      
//         req.body.serviceImage = uploadedFiles; // Keep this as images or change key name if needed
//       }
  
//       const deliveredBooking = await updateDocument(
//         "proBookingService",
//         { _id: id },
//         { status: "Delivered",  orderRescheduleStatus: "Delivered", serviceImage: uploadedFiles ?  uploadedFiles : undefined, }
//       );
  
      
//       if (!deliveredBooking || deliveredBooking.length == 0) {
//         return res
//         .status(400)
//         .json({ status: 400, message: "No Booking Found!" });
//       }
      
//       console.log(deliveredBooking.bookServiceId,"deliveredBooking.bookServiceId");
      
//       const deliveredRandomProBooking = await updateDocument(
//         "userBookServ",
//         { _id: deliveredBooking.bookServiceId },
//         { status: "Delivered",orderRescheduleStatus: "Delivered", serviceImage: uploadedFiles ?  uploadedFiles : undefined, }
//       );
  
      
      
//       return res
//         .status(200)
//         .json({
//           status: 200,
//           message: "Delivered Reshedule Service By Professional",
//           deliveredBooking,
//         });
//     }
//   } catch (e) {
//     console.log(e);
//     return res.status(400).json({ status: 400, message: e.message });
//   }
// };

// export default deliveredBooking;


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

const schema = Joi.object().keys({
  id: Joi.string().required(),
});

const schemaBody = Joi.object().keys({
  serviceImage: Joi.array().allow("").optional(),
   FinishedTime: Joi.string().required(),
  FinishedDate: Joi.string().required(),
});

// ✅ Helper function for parallel uploads
const uploadMediaFiles = async (files) => {
  const allowedImageTypes = ["image/jpeg", "image/png", "image/webp", "image/jfif"];
  const allowedVideoTypes = ["video/mp4", "video/quicktime", "video/webm"];
  const maxImageSizeMB = 2;
  const maxVideoSizeMB = 5;

  const mediaFiles = Array.isArray(files) ? files : [files];

  if (mediaFiles.length > 6) {
    throw new Error("Maximum 6 files allowed.");
  }

  // Validate all files before uploading
  for (const file of mediaFiles) {
    const fileSizeMB = file.size / (1024 * 1024);
    const isImage = allowedImageTypes.includes(file.type);
    const isVideo = allowedVideoTypes.includes(file.type);

    if (!isImage && !isVideo) {
      throw new Error("Only image and video files are allowed.");
    }
    // Uncomment to enforce image/video size limits
    // if (isImage && fileSizeMB > maxImageSizeMB) throw new Error("Image size should not exceed 2MB.");
    // if (isVideo && fileSizeMB > maxVideoSizeMB) throw new Error("Video size should not exceed 5MB.");
  }

  // Upload all in parallel
  const uploadedFiles = await Promise.all(
    mediaFiles.map((file) => {
      const isImage = allowedImageTypes.includes(file.type);
      const isVideo = allowedVideoTypes.includes(file.type);

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

      return cloudinary.uploader.upload(file.path, uploadOptions).then((res) => res.url);
    })
  );

  return uploadedFiles;
};

const deliveredBooking = async (req, res) => {
  try {
    await schema.validateAsync(req.params);
  //  await schemaBody.validateAsync(req.body);
    const { id } = req.params;

 const { FinishedTime, FinishedDate} = req.body;
 console.log(req.body,"body");
 
    const goingbooking = await findOne("proBookingService", { _id: id });

    if (!goingbooking) {
      return res.status(400).json({ status: 400, message: "No Booking Found!" });
    }

    let uploadedFiles = [];
    if (req?.files?.serviceImage) {
      uploadedFiles = await uploadMediaFiles(req.files.serviceImage);
      req.body.serviceImage = uploadedFiles;
    }

    // Prepare update data
    const updateData = {
      status: "Delivered",
      serviceImage: uploadedFiles.length ? uploadedFiles : undefined,
     FinishedTime, 
     FinishedDate 
    };

    if (goingbooking.orderRescheduleStatus !== "NA") {
      updateData.orderRescheduleStatus = "Delivered";
    }

    // Update in proBookingService
    const updatedBooking = await updateDocument("proBookingService", { _id: id }, updateData);

    if (!updatedBooking) {
      return res.status(400).json({ status: 400, message: "No Booking Found!" });
    }

    // Update in userBookServ
    const updatedUserBooking = await updateDocument(
      "userBookServ",
      { _id: updatedBooking.bookServiceId },
      updateData
    );

    return res.status(200).json({
      status: 200,
      message:
        goingbooking.orderRescheduleStatus === "NA"
          ? "Delivered Service By Professional"
          : "Delivered Reschedule Service By Professional",
      deliveredBooking: updatedBooking,
    });
  } catch (e) {
    console.log(e);
    return res.status(400).json({ status: 400, message: e.message });
  }
};

export default deliveredBooking;
