// export default updateProfile;
import Joi from "joi";
import fs from "fs/promises"; // Use async methods
import { updateDocument, findOne } from "../../../helpers/index.js";
import { v2 as cloudinary } from "cloudinary";
import send_email from "../../../lib/node-mailer/index.js";

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
  registeration: Joi.boolean(),
  mobile: Joi.string()
    .pattern(/^[0-9]+$/)
    .messages({
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
    const { registeration } = req.body;
    if (registeration) {
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

        uploadTasks.push(
          uploadVideo(videoPath).then(async (vid) => {
            req.body.video = vid.url;
            await fs.unlink(videoPath); // Delete video after upload
          })
        );
      }

      await Promise.all(uploadTasks); // Wait for uploads to complete

      const updatedUser = await updateDocument("user", { _id: id }, req.body);
      let email = updatedUser?.email;
      await send_email(
        "proRegisterTemplate",
        {
          user: updatedUser?.first_Name,
        },
        "owaisy028@gmail.com",
        "Your Pro Signup is Successful – Pending Review",
        email
      );

      return res.status(200).json({
        status: 200,
        message: "Profile updated successfully",
        data: { profile: updatedUser },
      });
    } else {
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
    }
  } catch (e) {
    console.error("Error in updateProfile:", e);
    return res.status(400).json({ status: 400, message: e.message });
  }
};

export default updateProfile;
