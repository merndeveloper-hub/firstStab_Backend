import mongoose from "mongoose";
import { insertNewDocument } from "../../helpers/index.js";


import Joi from "joi";

const schema = Joi.object({
  type: Joi.string().required(),
  status: Joi.string().required(),
});

const addUserType = async (req, res) => {
  try {
    const session = await mongoose.startSession();
    session.startTransaction();

    const validate = await schema.validateAsync(req.body);
    console.log(validate, "validate");

    const user_type = await insertNewDocument("userType", req.body);

    await session.commitTransaction();
    session.endSession();

    return res.status(200).send({ status: 200, user_type });
  } catch (e) {
    await session.abortTransaction();
    session.endSession();
    res.status(400).send({ status: 400, message: e.message });
  }
};

export default addUserType;
