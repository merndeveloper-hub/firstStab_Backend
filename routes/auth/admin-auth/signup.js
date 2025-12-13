
import bcrypt from "bcryptjs";
import {
  findOneAndSelect,
  insertNewDocument,
} from "../../../helpers/index.js";
import Joi from "joi";
import send_email from "../../../lib/node-mailer/index.js";


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
  userType: Joi.string().required(),
});

const adminSignup = async (req, res) => {
  const { email, password, userType } = req.body;
  try {
    await schema.validateAsync(req.body);

    const checkEmail = await findOneAndSelect(
      "user",
      { email }

    );
    if (checkEmail) {
      return res.status(400).send({
        status: 400,
        message: "User already exists",
      });
    }
    const user = await insertNewDocument("user", {
      mobile: '',
      userType,
      ...req.body,

      password: bcrypt.hashSync(password, bcrypt.genSaltSync(10)),
    });
    user.password = undefined;
    // user.type = undefined;
    req.userId = user._id;
    await send_email(
      "adminSignup", // Template name change
      {
        adminName: user.first_Name,

      },
      process.env.SENDER_EMAIL,
      "Welcome to FirstStab Admin Team",
      user.email
    );
    return res.status(200).send({ status: 200, user });
  } catch (error) {

    if (error.code === 11000) {


      // Duplicate key error
      return res.status(400).send({
        status: 400,
        message: "Email already exists. Please use a different email.",
      });
    }

    return res
      .status(400)
      .send({ status: 400, message: error.message});


  }
};

export default adminSignup;
