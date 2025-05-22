
import { find } from "../../../helpers/index.js";




const getadminCharge = async (req, res) => {
  try {
    

    const getadminFees = await find("adminFees");

    if (!getadminFees || getadminFees.length === 0) {
      return res.status(400).send({
        status: 400,
        message: "No charges found",
      });
    }

    return res.status(200).json({ status: 200, data: { getadminFees } });
  } catch (e) {
    console.log(e);
    return res.status(400).json({ status: 400, message: e.message });
  }
};

export default getadminCharge;
