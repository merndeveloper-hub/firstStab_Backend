import Joi from "joi";
import { findOne } from "../../../helpers/index.js";

const schema = Joi.object({
  id: Joi.string().required()
})

const getSingleProfile = async (req, res) => {
  try {
    await schema.validateAsync(req.params)

    const { id } = req.params;
    const getProfile = await findOne("user", { _id: id });
 
    if (!getProfile || getProfile.length == 0) {
      return res.status(400).send({ status: 400, message: "User not found" });
    }
    return res.status(200).json({ status: 200, data: { getProfile } });
  } catch (e) {
    console.log(e);
    return res.status(400).json({ status: 400, message: e.message });
  }
};

export default getSingleProfile;
