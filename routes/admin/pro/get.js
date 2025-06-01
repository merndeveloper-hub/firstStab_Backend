import { getAggregate } from "../../../helpers/index.js";

const getUser = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 5;
    const skip = (page - 1) * limit;

    // Aggregation pipeline
    const pipeline = [
      { $match: { userType: "pro" } },
      {
        $lookup: {
          from: "procategories",
          localField: "_id",
          foreignField: "proId",
          as: "categories",
        },
      },
      // {
      //   $match: {
      //     $expr: { $gt: [{ $size: "$categories" }, 0] }, // only include if categories exist
      //   },
      // },
      { $sort: { createdAt: -1 } },
      { $skip: skip },
      { $limit: limit },
    ];

    const getUsers = await getAggregate("user", pipeline);

    // Total valid pro users count (same aggregation without skip/limit)
    const totalCountPipeline = [
      { $match: { userType: "pro" } },
      {
        $lookup: {
          from: "procategories",
          localField: "_id",
          foreignField: "proId",
          as: "categories",
        },
      },
      {
        $match: {
          $expr: { $gt: [{ $size: "$categories" }, 0] },
        },
      },
      { $count: "total" },
    ];

    const totalCountResult = await getAggregate("user", totalCountPipeline);
    const totalLength = totalCountResult[0]?.total || 0;

    if (!getUsers || getUsers.length === 0) {
      return res.status(400).send({
        status: 400,
        message: "No valid professionals with categories found.",
      });
    }

    return res.status(200).send({
      status: 200,
      data: {
        getUsers,
        totalLength,
      },
    });
  } catch (e) {
    console.log(e);
    return res.status(500).send({ status: 500, message: e.message });
  }
};

export default getUser;
