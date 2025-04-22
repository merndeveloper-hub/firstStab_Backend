import Joi from "joi";
import fs from "fs";
import { updateDocument, findOne } from "../../../helpers/index.js";
import { v2 as cloudinary } from "cloudinary";
//import { cloudinary } from "../../../lib/index.js";
cloudinary.config({
  cloud_name: "dwebxmktr",
  api_key: "988681166781262",
  api_secret: "f4gUgqo7htBtD3eOGhfirdKd8kA",
});

const schema = Joi.object({
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
  mobile: Joi.string().pattern(new RegExp("^\\+?[0-9]{8,15}$")).messages({
    "string.pattern.base": "Mobile number must be 8-15 digits",
    "any.required": "Mobile number is required.",
  }),
});

const schemaForId = Joi.object({
  id: Joi.string().required(),
});

const updateProfile = async (req, res) => {
  try {
    await schemaForId.validateAsync(req.params);
    await schema.validateAsync(req.body);
    const { id } = req.params;
    const findUser = await findOne("user", { _id: id });
    if (!findUser || findUser.length == 0) {
      return res.status(400).send({ status: 400, message: "No User found" });
    }
    if (req?.files?.profile?.path) {
      const category_Image = await cloudinary.uploader.upload(
        req?.files?.profile?.path,
        { quality: 20, allowed_formats: ["jpg", "jpeg", "png", "jfif", "avif"] }
      );

      req.body.profile = category_Image?.url;
    }

    // if (req?.files?.video?.path) {
    //   const profile_Video = await cloudinary.uploader.upload(
    //     req?.files?.video?.path,
    //     {
    //       resource_type: "video", // Required for video uploads
    //       // Optional: Specify allowed formats
    //       allowed_formats: ["mp4", "mov", "webm"],
    //     }
    //   );

    //   req.body.video = profile_Video.url;
    // }

    if (req?.files?.video?.path) {
      const videoPath = req.files.video.path;
      const stats = fs.statSync(videoPath);
      const fileSizeInMB = stats.size / (1024 * 1024);

      if (fileSizeInMB > 5) {
        // Optional: Delete file to clean up
        fs.unlinkSync(videoPath);
        return res.status(400).json({ error: "Video exceeds 5MB limit" });
      }

      const profile_Video = await cloudinary.uploader.upload(videoPath, {
        resource_type: "video",
        allowed_formats: ["mp4", "mov", "webm"],
        transformation: [
          { quality: "auto:eco" }, // Eco = more compression
          { fetch_format: "mp4" }, // Use MP4 (widely supported)
          { width: 480, crop: "scale" }, // Downscale width (auto scale height)
        ],
      });

      // Optional: delete temp file after upload
      fs.unlinkSync(videoPath);

      req.body.video = profile_Video.url;
      // req.body.video = profile_Video.secure_url
    }
    const profile = await updateDocument(
      "user",
      {
        _id: id,
      },
      {
        ...req.body,
      }
    );
    console.log(profile, "profile-----");

    return res.status(200).send({
      status: 200,
      message: "Profile updated successfully",
      data: { profile },
    });
  } catch (e) {
    console.log(e);
    return res.status(400).send({ status: 400, message: e.message });
  }
};

export default updateProfile;
