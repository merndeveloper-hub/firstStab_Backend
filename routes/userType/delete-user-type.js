import  {deleteDocument} from "../../helpers/index.js";
import Joi from "joi";

const schema = Joi.object({
  _id: Joi.string().required(),
});

const deleteUserType = async (req, res) => {
  const { _id } = req.body;
  try {
    const validate = await schema.validateAsync(req.body);
    const deleteQuery = { _id };
    let response = await deleteDocument("userType", deleteQuery);
    return res.status(200).send({ status: 200, response });
  } catch (e) {
    res.status(400).send({ status: 400, message: e.message });
  }
};

export default deleteUserType;
