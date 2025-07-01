import Joi from "joi";
import { findOne } from "../../../helpers/index.js";

const schema = Joi.object().keys({
  id: Joi.string().required(),
});

const getSingleUser = async (req, res) => {
  try {
    await schema.validateAsync(req.params);
    const { id } = req.params;

    const singleUser = await findOne("user", { _id: id, userType: "user" });

    if (!singleUser || singleUser.length === 0) {
      return res.status(400).send({
        status: 400,
        message: "No User found",
      });
    }

    return res.status(200).json({ status: 200, data: { singleUser } });
  } catch (e) {
    console.log(e);
    return res.status(400).json({ status: 400, message: e.message });
  }
};

export default getSingleUser;
