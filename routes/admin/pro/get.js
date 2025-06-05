import { getAggregate } from "../../../helpers/index.js";

const getUser = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 5;
    const skip = (page - 1) * limit;

    const pipeline = [
      { $match: { userType: "pro" } },

      // Lookup categories
      {
        $lookup: {
          from: "procategories",
          localField: "_id",
          foreignField: "proId",
          as: "categories",
        },
      },

      // Unwind categories to process each one individually
      { $unwind: { path: "$categories", preserveNullAndEmptyArrays: true } },

      // Unwind subCategories array in each category
      { $unwind: { path: "$categories.subCategories", preserveNullAndEmptyArrays: true } },

      // Lookup subCategory document for each subCategories.id
      {
        $lookup: {
          from: "subcategories", // Ensure this matches your actual collection name
          localField: "categories.subCategories.id",
          foreignField: "_id",
          as: "subCategoryDetails",
        },
      },

      // Unwind subCategoryDetails array to get the single document (if any)
      { $unwind: { path: "$subCategoryDetails", preserveNullAndEmptyArrays: true } },

      // Add subCategory name and categoryName into the subCategories object
      {
        $addFields: {
          "categories.subCategories.name": "$subCategoryDetails.name",
          "categories.subCategories.categoryName": "$subCategoryDetails.categoryName",
        },
      },

      // Remove subCategoryDetails field from the document
      { $unset: "subCategoryDetails" },

      // Group back the subCategories array for each category
      {
        $group: {
          _id: {
            userId: "$_id",
            categoryId: "$categories._id",
          },
          userRoot: { $first: "$$ROOT" },
          category: { $first: "$categories" },
          subCategories: { $push: "$categories.subCategories" },
        },
      },

      // Group back categories array for each user
      {
        $group: {
          _id: "$_id.userId",
          userRoot: { $first: "$userRoot" },
          categories: { $push: "$category" },
        },
      },

      // Replace categories in userRoot with the reconstructed categories array
      {
        $addFields: {
          "userRoot.categories": "$categories",
        },
      },

      // Replace root with the updated user document
      {
        $replaceRoot: {
          newRoot: "$userRoot",
        },
      },

      // Sort, skip, limit
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
