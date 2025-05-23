
import { find } from "../../../helpers/index.js";




const getApiLogs = async (req, res) => {
  try {
    

    const getApiLog = await find("apiLog");
console.log(getApiLog,"getApiLog----");

    if (!getApiLog || getApiLog.length === 0) {
      return res.status(400).send({
        status: 400,
        message: "No Logs found",
      });
    }

    return res.status(200).json({ status: 200, data: { getApiLog } });
  } catch (e) {
    console.log(e);
    return res.status(400).json({ status: 400, message: e.message });
  }
};

export default getApiLogs;
