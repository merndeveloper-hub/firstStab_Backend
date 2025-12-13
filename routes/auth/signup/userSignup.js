import Joi from "joi";
import {
  insertNewDocument,
  findOneAndSelect,
  deleteDocument,
} from "../../../helpers/index.js";
import { JWT_EXPIRES_IN, JWT_EXPIRES_IN_REFRESH_TOKEN, REFRESH_TOKEN_SECRET, ACCESS_TOKEN_SECRET } from "../../../config/index.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import sendOTPSignup from "../otpVerification/sendOTPSignup.js";

const schema = Joi.object({
  first_Name: Joi.string().min(3).required(),
  last_Name: Joi.string().min(3).required(),
  email: Joi.string()
    .email({ tlds: { allow: true } }) // Ensures a valid domain with TLD (e.g., .com, .org)
    .pattern(new RegExp("^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$")) // Enforces common email rules
    .required()
    .messages({
      "string.email": "Invalid email format",
      "any.required": "Email is required",
      "string.pattern.base": "Invalid email structure",
    }),
  mobile: Joi.string()

    .required()
    .messages({
      "string.pattern.base":
        "Mobile number must be digits.",
      "any.required": "Mobile number is required.",
    }),
  password: Joi.string()
    .pattern(
      new RegExp(
        "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,30}$"
      )
    )
    .required()
    .messages({
      "string.pattern.base":
        "Password must be 8-30 characters, including uppercase, lowercase, number & special character.",
    }),
  confirm_password: Joi.string().required().valid(Joi.ref("password")),
  status: Joi.string(),
  userType: Joi.string().required(),
  country: Joi.string().required(),
  state: Joi.string().required(),
  city: Joi.string().required(),
  zipCode: Joi.string().required()
});

const userSignup = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {

    await schema.validateAsync(req.body)


    const {
      country,
      password,
      email,
      mobile,
      status,
      userType,
      first_Name,
      last_Name,
    } = req.body;

    const deleteEmailExist = await findOneAndSelect("user", { email, status: "InActive" });
    if (deleteEmailExist) {
      await deleteDocument("user", { email });
    }

    const emailExist = await findOneAndSelect("user", { email, status: "Active" });
    if (emailExist) {
      return res
        .status(400)
        .send({ status: 400, message: "User already exists with this email" });
    }
    const mobileExist = await findOneAndSelect("user", { mobile, status: "Active" });
    if (mobileExist) {
      return res
        .status(400)
        .send({ status: 400, message: "Mobile number already exists with this email" });
    }
  

    req.body.password = bcrypt.hashSync(password, bcrypt.genSaltSync(10));

   
    const user = await insertNewDocument("user", {
      ...req.body,
      password: req.body.password,
      email,
      mobile,
      status: "InActive",
      userType,
      first_Name,
      last_Name,
      avgReviewsPro: 0,
      totalReviewsPro: 0
 
    });

  

    var token = jwt.sign({ id: user._id, role: user.userType }, ACCESS_TOKEN_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
    });
    var refresh_token = jwt.sign({ id: user._id, role: user.userType }, REFRESH_TOKEN_SECRET, {
      expiresIn: JWT_EXPIRES_IN_REFRESH_TOKEN,
    });

    const inserttoken = await insertNewDocument("token", {
      user_id: user._id,
      accessToken: token,
      refreshToken: refresh_token,
      type: "refresh",
    });

    // Set Access Token in Cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production" ? true : false, // sirf prod me https
      sameSite: "none",
      maxAge: 1000 * 60 * 60 * 24 // 1 day (ya JWT_EXPIRES_IN ke hisaab se)
    });

    // Set Refresh Token in Cookie (optional)
    res.cookie("refreshToken", refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production" ? true : false,
      sameSite: "none",
      maxAge: 1000 * 60 * 60 * 24 * 7 // 7 din
    });

    req.userId = user._id;
    await sendOTPSignup({ email, userType })
    await session.commitTransaction();
    session.endSession();
    return res.json({
      status: 200,
      message: "OTP sent to your email. Check inbox to proceed.",
      data: {
        userId: user._id,
        token, refresh_token
      },
    });
   
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    if (error.code === 11000) {
      // Duplicate key error
      return res.status(400).send({
        status: 400,
        message: "Email already exists. Please use a different email.",
      });
    }
    // Handle other errors
    console.error("Error saving user:", error);

    return res.status(400).send({ status: 400, message: error.message });
  }
};

export default userSignup;
