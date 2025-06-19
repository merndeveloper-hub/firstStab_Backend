// import Joi from "joi";
// import fs from "fs";
// import { updateDocument, findOne } from "../../../helpers/index.js";
// import { v2 as cloudinary } from "cloudinary";
// //import { cloudinary } from "../../../lib/index.js";
// cloudinary.config({
//   cloud_name: "dwebxmktr",
//   api_key: "988681166781262",
//   api_secret: "f4gUgqo7htBtD3eOGhfirdKd8kA",
// });

// const schema = Joi.object({
//   first_Name: Joi.string(),
//   last_Name: Joi.string(),
//   profile: Joi.string(),
//   video: Joi.string(),
//   address_Type: Joi.string(),
//   address_line1: Joi.string(),
//   address_line2: Joi.string().allow("").optional(),
//   state: Joi.string(),
//   countryCode: Joi.string(),
//   city: Joi.string(),
//   zipCode: Joi.string(),
//    longitude: Joi.string(),
//     latitude: Joi.string(),
//   mobile: Joi.string().messages({
//     "string.pattern.base": "Mobile number must be digits",
//     "any.required": "Mobile number is required.",
//   }),
// });

// const schemaForId = Joi.object({
//   id: Joi.string().required(),
// });

// const updateProfile = async (req, res) => {
//   try {
//     await schemaForId.validateAsync(req.params);
//     await schema.validateAsync(req.body);
//     const { id } = req.params;
//     const findUser = await findOne("user", { _id: id });
//     if (!findUser || findUser.length == 0) {
//       return res.status(400).send({ status: 400, message: "No User found" });
//     }
//     if (req?.files?.profile?.path) {
//       const category_Image = await cloudinary.uploader.upload(
//         req?.files?.profile?.path,
//         { quality: 20, allowed_formats: ["jpg", "jpeg", "png", "jfif", "avif"] }
//       );

//       req.body.profile = category_Image?.url;
//     }

//     // if (req?.files?.video?.path) {
//     //   const profile_Video = await cloudinary.uploader.upload(
//     //     req?.files?.video?.path,
//     //     {
//     //       resource_type: "video", // Required for video uploads
//     //       // Optional: Specify allowed formats
//     //       allowed_formats: ["mp4", "mov", "webm"],
//     //     }
//     //   );

//     //   req.body.video = profile_Video.url;
//     // }

//     if (req?.files?.video?.path) {
//       const videoPath = req.files.video.path;
//       const stats = fs.statSync(videoPath);
//       const fileSizeInMB = stats.size / (1024 * 1024);

//       if (fileSizeInMB > 5) {
//         // Optional: Delete file to clean up
//         fs.unlinkSync(videoPath);
//         return res.status(400).json({ error: "Video exceeds 5MB limit" });
//       }

//       const profile_Video = await cloudinary.uploader.upload(videoPath, {
//         resource_type: "video",
//         allowed_formats: ["mp4", "mov", "webm"],
//         transformation: [
//           { quality: "auto:eco" }, // Eco = more compression
//           { fetch_format: "mp4" }, // Use MP4 (widely supported)
//           { width: 480, crop: "scale" }, // Downscale width (auto scale height)
//         ],
//       });

//       // Optional: delete temp file after upload
//       fs.unlinkSync(videoPath);

//       req.body.video = profile_Video.url;
//       // req.body.video = profile_Video.secure_url
//     }
//     const profile = await updateDocument(
//       "user",
//       {
//         _id: id,
//       },
//       {
//         ...req.body,
//       }
//     );
//     console.log(profile, "profile-----");

//     return res.status(200).send({
//       status: 200,
//       message: "Profile updated successfully",
//       data: { profile },
//     });
//   } catch (e) {
//     console.log(e);
//     return res.status(400).send({ status: 400, message: e.message });
//   }
// };

// export default updateProfile;
import Joi from "joi";
import fs from "fs/promises"; // Use async methods
import { updateDocument, findOne } from "../../../helpers/index.js";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: "dwebxmktr",
  api_key: "988681166781262",
  api_secret: "f4gUgqo7htBtD3eOGhfirdKd8kA",
});

const bodySchema = Joi.object({
  first_Name: Joi.string(),
  last_Name: Joi.string(),
  profile: Joi.string(),
  video: Joi.string(),
  address_Type: Joi.string(),
  address_line1: Joi.string(),
  address_line2: Joi.string().allow("").optional(),
  state: Joi.string(),
  countryCode: Joi.string(),
  city: Joi.string(),
  zipCode: Joi.string(),
  longitude: Joi.string(),
  latitude: Joi.string(),
  mobile: Joi.string().pattern(/^[0-9]+$/).messages({
    "string.pattern.base": "Mobile number must be digits",
  }),
});

const idSchema = Joi.object({
  id: Joi.string().required(),
});

const uploadImage = async (path) =>
  cloudinary.uploader.upload(path, {
    quality: 20,
    allowed_formats: ["jpg", "jpeg", "png", "jfif", "avif"],
  });

const uploadVideo = async (path) =>
  cloudinary.uploader.upload(path, {
    resource_type: "video",
    allowed_formats: ["mp4", "mov", "webm"],
    transformation: [
      { quality: "auto:eco" },
      { fetch_format: "mp4" },
      { width: 480, crop: "scale" },
    ],
  });

const updateProfile = async (req, res) => {
  try {
    await Promise.all([
      idSchema.validateAsync(req.params),
      bodySchema.validateAsync(req.body),
    ]);

    const { id } = req.params;
    const user = await findOne("user", { _id: id });

    if (!user) {
      return res.status(400).json({ status: 400, message: "No User found" });
    }

    const uploadTasks = [];

    if (req?.files?.profile?.path) {
      uploadTasks.push(
        uploadImage(req.files.profile.path).then((img) => {
          req.body.profile = img.url;
        })
      );
    }

    if (req?.files?.video?.path) {
      const videoPath = req.files.video.path;

      // Optional: Check file size
      const stats = await fs.stat(videoPath);
      if (stats.size > 5 * 1024 * 1024) {
        await fs.unlink(videoPath);
        return res.status(400).json({ status: 400, message: "Video exceeds 5MB limit" });
      }

      uploadTasks.push(
        uploadVideo(videoPath).then(async (vid) => {
          req.body.video = vid.url;
          await fs.unlink(videoPath); // Delete video after upload
        })
      );
    }

    await Promise.all(uploadTasks); // Wait for uploads to complete

    const updatedUser = await updateDocument("user", { _id: id }, req.body);

    return res.status(200).json({
      status: 200,
      message: "Profile updated successfully",
      data: { profile: updatedUser },
    });
  } catch (e) {
    console.error("Error in updateProfile:", e);
    return res.status(400).json({ status: 400, message: e.message });
  }
};

export default updateProfile;
