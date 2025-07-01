import Joi from "joi";
import { findOne} from "../../../helpers/index.js";



const getInfo = async (req, res) => {
  try {

    const getUser = await findOne("user", { _id: req.params.id });

    if (!getUser) {
      return res.status(400).json({ status: 400, message: "No User Found!" });
    }
   

    const userInfo = {
     fullName: getUser.first_Name + " " + getUser.last_Name,
     email: getUser.email,
     mobile:getUser.mobile
    }

    return res.status(200).json({ status: 200, data: getUser });
  } catch (e) {
    return res.status(500).json({ status: 500, message: e.message });
  }
};

export default getInfo;
