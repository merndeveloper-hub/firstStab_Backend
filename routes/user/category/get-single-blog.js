import Joi from "joi";
import { find, findOne, getAggregate, getDataWithLimit } from "../../../helpers/index.js";
import  ObjectID  from "../../../types/index.js";
import category from "../../../models/categorie/index.js";

const schema = Joi.object().keys({
  id: Joi.string().required(),
});

const getSingleCategory = async (req, res) => {
  try {
    await schema.validateAsync(req.params);
    const { id } = req.params;
    console.log(typeof id,"id");
   console.log(req.query.page,"req.query.page");

  const page = parseInt(req.query.page) || 1; // Default to page 1
  console.log(page,"page");
  
const limit = 5; // Show 5 subcategories per page
const skip = (page - 1) * limit;
console.log(skip,"skip");
    //const singleCategory = await find("proCategory", {_id:id})
   
    // let page = Number(req.query.page) || 1;
    // let limit = Number(req.query.limit) || 9;

    // let skip = (page - 1) * limit;

    const singleCategories = await getDataWithLimit("subCategory", {categoryId:id}, skip, limit);

   // const singleCategories = await getAggregate("subcategory", [
    //   // {
    //   //   $match: { _id: id },
    //   // },
    //   {
       
    //     $lookup: {
    //       from: "subcategories",
    //       let: { categoryId: "$_id" },
    //       pipeline: [
    //         { $match: { $expr: { $eq: ["$categoryId", "$$categoryId"] } } },
    //         { $sort: { _id: 1 } }, // Sort subcategories (optional)
    //         { $skip: skip }, // Skip records for pagination
    //         { $limit: limit } // Limit to 5 per page
    //       ],
    //       as: "subCategory",
    //     },
    //   },
    //   { $sort: { _id: 1 } }, // Sort categories
    // ]);

   console.log(singleCategories,"singleCategories");
    
    return res.status(200).json({ status: 200, data:{singleCategories} });
  } catch (e) {
    console.log(e);
    return res.status(500).json({ status: 500, message: e.message });
  }
};

export default getSingleCategory;
