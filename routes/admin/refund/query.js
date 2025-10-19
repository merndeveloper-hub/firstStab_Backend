import Joi from "joi";

import { findOne,find, getDataWithLimit } from "../../../helpers/index.js";

const schema = Joi.object().keys({
  id: Joi.string().required(),
});

const getQuery = async (req, res) => {
  try {
    await schema.validateAsync(req.params);
    const { id } = req.params;
    const page = parseInt(req.query.page) || 1;

    const limit = 5;
    const skip = (page - 1) * limit;
    const sort = { createdAt: -1 };

    const getReportQuery = await getDataWithLimit(
      "reportQuery",
      { id },
      sort,
      skip,
      limit
    );

    const findUser = await findOne("user", { _id: id });
    if (!findUser || findUser.length == 0) {
      return res.status(400).json({
        status: 400,
        message: "No User found!",
      });
    }

    const reportQuery = await find("reportQuery", {
      id,
    });

    return res.status(200).json({
      status: 200,
      data: { getReportQuery, totalLength: reportQuery?.length },
    });
  } catch (e) {
    console.log(e);
    return res.status(400).json({ status: 400, message: e.message });
  }
};

export default getQuery;
