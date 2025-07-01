import { getAggregate } from "../../../helpers/index.js";

const getAllCategories = async (req, res) => {
// console.log(req.query.page,"req.query.page");

//   const page = parseInt(req.query.page) || 1; // Default to page 1
//   console.log(page,"page");
  
// const limit = 5; // Show 5 subcategories per page
// const skip = (page - 1) * limit;
// console.log(skip,"skip");

  try {
    const categories = await getAggregate("category", [
      // {
      //   $lookup: {
      //     from: "subcategories",
      //     let: { categoryId: "$_id" },
      //     pipeline: [
      //       { $match: { $expr: { $eq: ["$categoryId", "$$categoryId"] } } },
      //       // { $sort: { _id: 1 } }, // Sort subcategories (optional)
      //       // { $skip: skip }, // Skip records for pagination
      //       // { $limit: limit } // Limit to 5 per page
      //     ],
      //     as: "subCategory",
      //   },
      // },
      { $sort: { _id: 1 } }, // Sort categories
    ]);
    console.log(categories,"categories");
    
    return res.status(200).json({ status: 200, data:{categories} });
  } catch (e) {
    console.log(e);
    return res.status(500).json({ status: 500, message: e.message });
  }
};

export default getAllCategories;


