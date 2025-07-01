import Joi from "joi";
import { find } from "../../../helpers/index.js";
import userType from "../../../models/userType/index.js";

const schema = Joi.object({
  id: Joi.string().required()
})

const getBusinInfo = async (req, res) => {
  try {
    await schema.validateAsync(req.params)
    const {id} = req.params
    const getBusinness = await find("user",{_id:id,userType:"pro"});
  
    if (!getBusinness || getBusinness.length === 0) {
     
      return res.status(400).send({
        status: 400,
        message: "No Buniness Info found"
      });
    }

    return res.status(200).json({ status: 200, data: { getBusinness } });
  } catch (e) {
    console.log(e);
    return res.status(400).json({ status: 400, message: e.message });
  }
};

export default getBusinInfo;
