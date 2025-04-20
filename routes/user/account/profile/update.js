import Joi from "joi";
import { updateDocument, findOne } from "../../../../helpers/index.js";
import { v2 as cloudinary } from "cloudinary";

//import { cloudinary } from "../../../lib/index.js";
cloudinary.config({
  cloud_name:'dwebxmktr',
  api_key: '988681166781262',
  api_secret: 'f4gUgqo7htBtD3eOGhfirdKd8kA',
});


const schema = Joi.object({

profile: Joi.string(),
  first_Name: Joi.string().min(3),
  last_Name: Joi.string().min(3),
  email: Joi.string()
    .email({ tlds: { allow: true } }) // Ensures a valid domain with TLD (e.g., .com, .org)
    .pattern(new RegExp("^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$")) // Enforces common email rules
    
    .messages({
      "string.email": "Invalid email format",
      "any.required": "Email is required",
      "string.pattern.base": "Invalid email structure",
    }),
mobile: Joi.string()
        .pattern(new RegExp("^\\+?[0-9]{8,15}$"))
        .messages({
          "string.pattern.base":
            "Mobile number must be 8-15 digits and may include a country code (e.g., +123456789).",
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
    const findCategory = await findOne("user", { _id: id,userType:'user' });
    if (!findCategory) {
      return res.status(404).send({ status: 404, message: "No User found" });
    }
if( req.files.profile){

  const profile_Image = await cloudinary.uploader.upload(
         req?.files?.profile?.path,
         { quality: 20,allowed_formats: ['jpg', 'jpeg', 'png','jfif'] }
         
       );
 
       req.body.profile = profile_Image.url;
}




    const profile = await updateDocument(
      "user",
      {
        _id: id,
      },
      {
        profile: req?.body?.profile,
       
        ...req.body,
      }
    );

    return res
      .status(200)
      .send({ status: 200, message: "Profile updated successfully", data:{profile} });
  } catch (e) {
    console.log(e);
    return res.status(500).send({ status: 500, message: e.message });
  }
};

export default updateProfile;
