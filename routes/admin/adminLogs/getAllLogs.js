import { find, getDataWithLimit } from "../../../helpers/index.js";

const getLogs = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;

    const limit = 5;
    const skip = (page - 1) * limit;
    const sort = { createdAt: -1 };
    const logs = await getDataWithLimit(
      "apiLog",
      {},
    {},
      skip,
      limit
    )

    if (!logs || logs.length == 0) {
      return res.status(400).send({
        status: 400,
        message: "No logs found",
      });
    }
//const findLogs = await find('apiLog')
    return res.status(200).json({ status: 200, data: { logs } });
  } catch (e) {
    console.log(e);
    return res.status(400).json({ status: 400, message: e.message });
  }
};

export default getLogs;
