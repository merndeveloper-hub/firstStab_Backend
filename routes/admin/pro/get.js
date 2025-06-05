import { getAggregate } from "../../../helpers/index.js";

const getUser = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 5;
    const skip = (page - 1) * limit;

    // Aggregation pipeline
    // const pipeline = [
    //   { $match: { userType: "pro" } },
    //   {
    //     $lookup: {
    //       from: "procategories",
    //       localField: "_id",
    //       foreignField: "proId",
    //       as: "categories",
    //     },
    //   },
    //   { $sort: { createdAt: -1 } },
    //   { $skip: skip },
    //   { $limit: limit },
    // ];

    const pipeline = [
  { $match: { userType: "pro" } },

  // Lookup categories
  {
    $lookup: {
      from: "procategories",
      localField: "_id",
      foreignField: "proId",
      as: "categories"
    }
  },

  // Unwind categories to process each one individually
  { $unwind: { path: "$categories", preserveNullAndEmptyArrays: true } },

  // Unwind subCategories array in each category
  { $unwind: { path: "$categories.subCategories", preserveNullAndEmptyArrays: true } },

  // Lookup subCategory document for each subCategories.id
  {
    $lookup: {
      from: "subcategories", // check your exact collection name here
      localField: "categories.subCategories.id",
      foreignField: "_id",
      as: "subCategoryDetails"
    }
  },

  // Unwind subCategoryDetails array to get the single document (if any)
  { $unwind: { path: "$subCategoryDetails", preserveNullAndEmptyArrays: true } },

  // Add subCategory name into the subCategories object
  {
    $addFields: {
      "categories.subCategories.name": "$subCategoryDetails.name",
      "categories.subCategories.categoryName": "$subCategoryDetails.categoryName",
    }
  },

  // Group back the subCategories array for each category
  {
    $group: {
      _id: {
        userId: "$_id",
        categoryId: "$categories._id"
      },
      userRoot: { $first: "$$ROOT" }, // save entire user doc
      category: { $first: "$categories" },
      subCategories: { $push: "$categories.subCategories" }
    }
  },

  // Reconstruct categories with subCategories array
  {
    $addFields: {
      "category.subCategories": "$subCategories"
    }
  },

  // Group back categories array for each user
  {
    $group: {
      _id: "$_id.userId",
      userRoot: { $first: "$userRoot" },
      categories: { $push: "$category" }
    }
  },

  // Replace categories in userRoot with the reconstructed categories array
  {
    $addFields: {
      "userRoot.categories": "$categories"
    }
  },

  // Replace root with the updated user document
  {
    $replaceRoot: {
      newRoot: "$userRoot"
    }
  },

  // Sort, skip, limit as you had
  { $sort: { createdAt: -1 } },
  { $skip: skip },
  { $limit: limit }
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
