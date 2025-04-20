import Joi from "joi";
import { find, findOne, getAggregate, getDataWithLimit } from "../../../helpers/index.js";
import mongoose, { isObjectIdOrHexString, isValidObjectId } from "mongoose";
//import  ObjectID  from "../../../types/index.js";


const schema = Joi.object().keys({
  id: Joi.string().required(),
});

const getSingleCategoryCount = async (req, res) => {
  try {
    await schema.validateAsync(req.params);
    const { id } = req.params;
 //   console.log(typeof id,"id");
  // console.log(req.query.page,"req.query.page");
  
  
  const getUserCategory = await find('proCategory',{userId:id})
  console.log(getUserCategory,"getUserCategory");
  // Har object ke andar `subCategories` ka length add karega
  const getcategory = await find('category')

console.log(getcategory,"getcategory");
// const category = getcategory.find(cat =>cat._id  == getUserCategory[0].categoryId);
//   console.log(category,"cat");
  


  const result = getUserCategory.map(item => {
    const category = getcategory.find(cat => String(cat._id) === String(item.categoryId));
  
    console.log(category, "cate");
  
    return {
      name: category ? category.name : 'Unknown',
      subCategoryCount: item.subCategories.length
    };
  });

console.log(result,"result");

  // const singleUserCategory = await getAggregate("proCategory",[
  //   {
  //     $lookup: {
  //       from: "proCategories", // Pehle proCategories collection ko join karna hai
  //       localField: "userId",
  //       foreignField: "userId",
  //       as: "userCategories"
  //     }
  //   },
  //   {
  //     $unwind: {
  //       path: "$userCategories",
  //       preserveNullAndEmptyArrays: true
  //     }
  //   }
    // {
    //   $lookup: {
    //     from: "categories", // Ab categories collection ko join karna hai
    //     localField: "categoryId",
    //     foreignField: "_id",
    //     as: "categoryDetails"
    //   }
    // },
    // {
    //   $unwind: {
    //     path: "$categoryDetails",
    //     preserveNullAndEmptyArrays: true
    //   }
    // },
    // {
    //   $group: {
    //     _id: "$userId",
    //     categories: {
    //       $addToSet: {
    //         categoryId: "$categoryId",
    //         categoryName: "$categoryDetails.name",
    //         subCategoryLength: { $size: "$subCategories" }
    //       }
    //     }
    //   }
    // }
  //])
  
 //  console.log(getUserCategory,"singleCategories");
    
    return res.status(200).json({ status: 200, data:{result} });
  } catch (e) {
    console.log(e);
    return res.status(500).json({ status: 500, message: e.message });
  }
};

export default getSingleCategoryCount;
