const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { SECRET } = require("../../../config");
const { findOneAndSelect, getAggregate } = require("../../../helpers");
const Joi = require("joi");


const schema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().pattern(new RegExp("^[a-zA-Z0-9]{6,30}$")).required(),
});

const adminLogin = async (req, res) => {
  const { email, password } = req.body;
  try {
    await schema.validateAsync(req.body);
    const user = await getAggregate("user", [
      {
        $match: {
          email,
        },
      },
      {
        $lookup: {
          from: "user-types",
          localField: "type",
          foreignField: "_id",
          as: "type",
        },
      },
      {
        $unwind: "$type",
      },
      {
        $project: {
          followers: 0,
          following: 0,
        },
      },
    ]);
    if (user.length) {
      if (!user[0]?.password) {
        return res
          .status(404)
          .send({ status: 400, message: "No Password found" });
      }
      const passwordIsValid = bcrypt.compareSync(password, user[0]?.password);
      if (!passwordIsValid) {
        return res
          .status(400)
          .send({ status: 400, message: "Invalid Email or Password!" });
      }
      if (user[0].status === "Disabled") {
        return res
          .status(400)
          .send({ status: 400, message: "Your account is Disabled" });
      }
      user[0].password = undefined;
      var token = jwt.sign({ id: user[0]._id }, SECRET, {
        expiresIn: "24h",
      });
      req.userId = user[0]._id;
     
      res.status(200).send({ status: 200, user: user[0], token });
    } else {
      return res
        .status(404)
        .send({ status: 404, message: "User does not exist!" });
    }
  } catch (e) {
    res.status(400).send({ status: 400, message: e.message });
  }
};

module.exports = adminLogin;
