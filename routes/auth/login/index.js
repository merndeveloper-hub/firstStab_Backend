import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { JWT_EXPIRES_IN, JWT_EXPIRES_IN_REFRESH_TOKEN, REFRESH_TOKEN_SECRET, SECRET } from "../../../config/index.js";
import {
  findOneAndSelect,
  findOne,
  insertNewDocument,
  updateDocument,
} from "../../../helpers/index.js";
import Joi from "joi";

const schema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
  userType: Joi.string().required()
});

const loginUser = async (req, res) => {
  const { email, password,userType } = req.body;
  
  try {
    await schema.validateAsync(req.body);

    const user = await findOneAndSelect(
      "user",
      { email,userType }
    );


    if (user) {
      if (!user?.password) {
        return res
          .status(400)
          .send({ status: 400, message: "No Password found" });
      }
      const passwordIsValid = bcrypt.compareSync(password, user?.password);
      if (!passwordIsValid) {
        const updateAttempt = await findOne("attempt", { user_id: user._id });
        if (!updateAttempt) {
          const insertAttempt = await insertNewDocument("attempt", {
            user_id: user._id,
            no_of_attempt: 1,
          });
          return res
            .status(400)
            .send({ status: 400, message: "Invalid Email or Password!" });
        }
        // if (updateAttempt) {
        console.log(updateAttempt?.block_duration);
        const blockTime = new Date(updateAttempt?.block_duration).getTime();
        console.log(blockTime);
        const now = new Date().getTime();
        const diff = blockTime > now ? true : false;
        console.log(now);
        console.log(diff);
        const diffMs = blockTime - now;
        if (updateAttempt.block && updateAttempt.no_of_attempt === 6 && diff) {
          console.log(diff);
          return res.status(400).send({
            status: 400,
            // message: "Your account is blocked for 5 minutes",
            message: `You are blocked for ${Math.round(
              (diffMs % 86400000) / 60000
            )} minutes`,
          });
        }
        if (updateAttempt.block && updateAttempt.no_of_attempt >= 11 && diff) {
          const hrs =
            Math.round((diffMs % 86400000) / 3600000 - 1) <= 0
              ? ""
              : `${Math.round((diffMs % 86400000) / 3600000 - 1)} hr & `;
          const minutes = Math.round(((diffMs % 86400000) % 3600000) / 60000);
          return res.status(400).send({
            status: 400,
            message: `You are blocked for ${hrs}${minutes} minutes`,
          });
        }
        // }

        if (updateAttempt.no_of_attempt === 5) {
          const blockUser = await updateDocument(
            "attempt",
            {
              user_id: user._id,
            },
            {
              block: true,
              block_duration: Date.now() + 60000 * 30, // for 30 minutes
              no_of_attempt: updateAttempt.no_of_attempt + 1,
            }
          );
          return res.status(400).send({
            status: 400,
            message: "Now You are blocked for 30 minutes",
          });
        }
        if (updateAttempt.no_of_attempt >= 10) {
          const blockUser = await updateDocument(
            "attempt",
            {
              user_id: user._id,
            },
            {
              block: true,
              block_duration: Date.now() + 60000 * 60 * 24, // for 24 hours
              no_of_attempt: updateAttempt.no_of_attempt + 1,
            }
          );
          return res
            .status(400)
            .send({ status: 400, message: "Now You are blocked for 24 hours" });
        }
        const increaseAttempt = await updateDocument(
          "attempt",
          {
            user_id: user._id,
          },
          {
            no_of_attempt: updateAttempt.no_of_attempt + 1,
          }
        );
        return res
          .status(400)
          .send({ status: 400, message: "Invalid Email or Password!" });
      }
      const updateAttempt = await findOne("attempt", { user_id: user._id });
      if (updateAttempt) {
        const blockTime = new Date(updateAttempt?.block_duration).getTime();
        const now = new Date().getTime();
        const diff = blockTime > now ? true : false;
        const diffMs = blockTime - now;
        if (updateAttempt.block && updateAttempt.no_of_attempt === 6 && diff) {
          return res.status(400).send({
            status: 400,
            message: `You are blocked for ${Math.round(
              (diffMs % 86400000) / 60000
            )} minutes`,
          });
        }
        if (updateAttempt.block && updateAttempt.no_of_attempt >= 11 && diff) {
          const hrs =
            Math.round((diffMs % 86400000) / 3600000 - 1) <= 0
              ? ""
              : `${Math.round((diffMs % 86400000) / 3600000 - 1)} hr & `;
          const minutes = Math.round(((diffMs % 86400000) % 3600000) / 60000);
          return res.status(400).send({
            status: 400,
            message: `You are blocked for ${hrs}${minutes} minutes`,
          });
        }
      }
      if (user.status === "Disabled") {
        return res
          .status(400)
          .send({ status: 400, message: "Your account is Disabled" });
      }
      user.password = undefined;
      const resetAttempt = await updateDocument(
        "attempt",
        {
          user_id: user._id,
        },
        {
          no_of_attempt: 0,
          block: false,
          // block_duration: null,
        }
      );
   
      var token = jwt.sign({ id: user._id ,role:user.userType}, SECRET, {
        expiresIn: JWT_EXPIRES_IN,
      });
      var refresh_token = jwt.sign({ id: user._id, role:user.userType}, REFRESH_TOKEN_SECRET, {
        expiresIn: JWT_EXPIRES_IN_REFRESH_TOKEN,
      });


const US_COUNTRIES = [
  "United States",
  "American Samoa",
  "Guam",
  "Northern Mariana Islands",
  "Puerto Rico",
  "U.S. Virgin Islands",
  "United States Minor Outlying Islands",
];

const isUS = US_COUNTRIES.includes(user?.country);
const region = isUS ? "US" : "Non-US";


      const inserttoken = await insertNewDocument("token", {
        user_id: user._id,
        token:refresh_token,
        type:"refresh"
      });
      req.userId = user._id;
     
  //res.cookie("refreshToken", refresh_token, { httpOnly: true, secure: true, sameSite: "Strict" });

      
  return res.status(200).send({ status: 200, data:{user,  region:region, token,refresh_token} });


    } else {
      return res
        .status(400)
        .send({ status: 400, message: "User does not exist!" });
    }
  } catch (e) {
    res.status(400).send({ status: 400, message: e.message });
  }
};

export default loginUser;
