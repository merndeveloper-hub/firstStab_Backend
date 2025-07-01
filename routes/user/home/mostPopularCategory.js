import { getAggregate } from "../../../helpers/index.js";

const mostPopularCategory = async (req, res) => {
  try {
   
    
    const categories = await getAggregate("userBookServ", [
      {
        "$group": {
          "_id": "$categoryId",
          "count": { "$sum": 1 }
        }
      },
      {
        "$sort": { "count": -1 }
      },
      {
        "$lookup": {
          "from": "categories",
          "localField": "_id",
          "foreignField": "_id",
          "as": "categoryDetails"
        }
      },
      {
        "$unwind": "$categoryDetails"
      },
      {
        "$lookup": {
          "from": "subcategories",
          "localField": "_id",
          "foreignField": "categoryId",
          "as": "relatedSubCategories"
        }
      }
    
    ]);

   
 
console.log(categories,"mostPopularCategory");

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

export default mostPopularCategory;


