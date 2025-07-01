// const jwt = require("jsonwebtoken");
// const Joi = require("joi");
// const { SECRET } = require("../../config");
// const { findOneAndSelect, findOneAndPopulate } = require("../../helpers");
// const saveActivity = require('../../middleware/activity/save-activity');

// const schema = Joi.object({
//   token: Joi.string().required(),
// });

// const verifyToken = async (req, res, next) => {
//   try {
//     await schema.validateAsync(req.query);
//     const { token } = req.query;
    
//     jwt.verify(token, SECRET, async (err, decoded) => {
//       if (err) {
//         return res
//           .status(401)
//           .send({ status: 401, message: "Token Unauthorized!" });
//       }


//       const inserttoken = await insertNewDocument("token", {
//               user_id: user._id,
//               token:refresh_token,
//               type:"refresh"
//             });

//       const isUserExist = await findOneAndPopulate(
//         "user",
//         { _id: decoded.id },
//         "type"
//       );
//       if (!isUserExist) {
//         return res.status(404).send({
//           status: 404,
//           message: "No longer User exists with your token",
//         });
//       }
//       isUserExist.password = undefined;
//       // isUserExist.type = undefined;
//      // saveActivity(req, res, `User ${isUserExist._id} verified token successfully`);
//       return res
//         .status(200)
//         .send({ status: 200, message: "Authorized", user: isUserExist });
//     });
//   } catch (e) {
//     console.log(e);
//     return res.status(500).send({ status: 500, message: e.message });
//   }
// };

// module.exports = verifyToken;


// app.post("/refresh", async (req, res) => {
//   const refreshToken = req.cookies.refreshToken;
//   if (!refreshToken) return res.sendStatus(401);

//   const user = await User.findOne({ refreshToken });
//   if (!user) return res.sendStatus(403);

//   jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, decoded) => {
//     if (err) return res.sendStatus(403);

//     const newAccessToken = generateAccessToken(user);
//     res.json({ accessToken: newAccessToken });
//   });
// });


import jwt from "jsonwebtoken";
import  {JWT_EXPIRES_IN_REFRESH_TOKEN, REFRESH_TOKEN_SECRET}  from "../../config/index.js";
import  {findOne, insertNewDocument} from "../../helpers/index.js";

const checkToken = async(req, res) => {
  try {
    let {token,id} = req.body;
    if (!token) {
      return res
        .status(404)
        .send({ status: 404, message: "No token provided!" });
    }

    const istokenExist = await findOne("token", { token });

    jwt.verify(token, REFRESH_TOKEN_SECRET, async (err, decoded) => {
      console.log(decoded,"decoded");
      
      if (err) {
        console.log(err);
        return res
          .status(400)
          .send({ status: 400, message: "Token Unauthorized!" });
      }
      // if (!decoded.user) {
      // 	return res.status(400).send({ status: 400, message: "Upgrade your token" });
      // }
      const isUserExist = await findOne("user", { _id: id });

         var refresh_token = jwt.sign({ id: isUserExist._id }, REFRESH_TOKEN_SECRET, {
              expiresIn: JWT_EXPIRES_IN_REFRESH_TOKEN,
            });


      const inserttoken = await insertNewDocument("token", {
                      user_id: isUserExist._id,
                      token:refresh_token,
                      type:"refresh"
                    });
                    return res.status(200).send({ status: 200, data:{refresh_token} });
    });
  } catch (e) {
    console.log("Token verification Error", e.message);
    return res.status(400).send({ status: 400, message: e.message });
  }
};

export default checkToken ;
