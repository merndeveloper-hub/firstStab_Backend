import { getAggregate } from "../../../helpers/index.js";

const getAllCategoriesWithSubcate = async (req, res) => {
  try {
    const categories = await getAggregate("category", [
      {
          $match:{status:"Active"}
      },
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


    if (!categories || categories.length === 0) {
     
      return res.status(400).send({
        status: 400,
        message: "Category Not found"
      });
    }
    
    return res.status(200).json({ status: 200, data:{categories} });
  } catch (e) {
    console.log(e);
    return res.status(400).json({ status: 400, message: e.message });
  }
};

export default getAllCategoriesWithSubcate;


