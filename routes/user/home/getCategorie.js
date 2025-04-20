import { getAggregate } from "../../../helpers/index.js";

const getAllCategories = async (req, res) => {
  try {
    const categories = await getAggregate("category", [
      {
        $lookup: {
          from: "subcategories",
          let: { categoryId: "$_id" },
          pipeline: [
            { $match: { $expr: { $eq: ["$categoryId", "$$categoryId"] } } },
           
          ],
          as: "subCategory",
        },
      },
      {
        $sort: { _id: -1 },
      },
    
    ]);
    console.log(categories,"categories");
    
    return res.status(200).json({ status: 200, data:{categories} });
  } catch (e) {
    console.log(e);
    return res.status(500).json({ status: 500, message: e.message });
  }
};

export default getAllCategories;


