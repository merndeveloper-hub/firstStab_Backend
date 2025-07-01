import Joi from "joi";
import { find } from "../../../../helpers/index.js";

const schema = Joi.object({
  id:Joi.string().required()
})

const getAddress = async (req, res) => {
  try {
    await schema.validateAsync(req.params)
    const {id} = req.params
    const getAddress = await find("address",{userId:id});
    if (!getAddress || getAddress.length == 0) {
      return res.status(400).send({ status: 400, message: "No Address found" });
    }
    return res.status(200).send({ status: 200, data: { getAddress } });
  } catch (e) {
    console.log(e);
    return res.status(400).send({ status: 400, message: e.message });
  }
};

export default getAddress;
