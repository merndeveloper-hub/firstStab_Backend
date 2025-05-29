import { getDataWithLimit,find } from "../../../helpers/index.js";

const getadminCharge = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;

    const limit = 5;
    const skip = (page - 1) * limit;
    const sort = { createdAt: -1 };
    const getadminFees = await getDataWithLimit(
      "adminFees",
      {},
      sort,
      skip,
      limit
    );

    const getTotaladminFees = await find("adminFees");

    if (!getadminFees || getadminFees.length === 0) {
      return res.status(400).send({
        status: 400,
        message: "No charges found",
      });
    }

    return res
      .status(200)
      .json({
        status: 200,
        data: { getadminFees, totalLength: getTotaladminFees?.length },
      });
  } catch (e) {
    console.log(e);
    return res.status(400).json({ status: 400, message: e.message });
  }
};

export default getadminCharge;
