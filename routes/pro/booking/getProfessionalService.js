import Joi from "joi";
import { getAggregate } from "../../../helpers/index.js";
import mongoose from "mongoose";
//import schemaType from "../../../types/index.js";

const schema = Joi.object({

  categoryId: Joi.string().hex().length(24).required(),
  subCategorieId: Joi.string().hex().length(24).required(),
  // userId: Joi.string().hex().length(24).required(),
  servieType: Joi.string()

});





const getProfessional = async (req, res) => {
  try {
   

  
    await schema.validateAsync(req.body)
    const { categoryId, subCategorieId, servieType } = req.body


    const proService = await getAggregate("proCategory", [

      {
        $match: { categoryId: new mongoose.Types.ObjectId(categoryId) } // Match categoryId
      },
      {
        $project: {
          _id: 1,
          proId: 1,
          rating: 1,
          categoryId: 1,
          subCategories: {
            $filter: {
              input: "$subCategories",
              as: "sub",
              cond: {
                $and: [
                  { $eq: ["$$sub.id", new mongoose.Types.ObjectId(subCategorieId)] }, // Match subCategorieId
                  { $eq: [`$$sub.${servieType}`, true] } // Check if serviceType is true
                ]
              }
            }
          }
        }
      },
      {
        $match: { "subCategories.0": { $exists: true } } // Ensure at least one matching subCategory exists
      },
      {
        $lookup: {
          from: "users", // Join with users collection
          localField: "proId",
          foreignField: "_id",
          as: "userDetails"
        }
      },
      {
        $unwind: { path: "$userDetails", preserveNullAndEmptyArrays: true } // Flatten user details
      },
      {
        $group: {
          _id: "$_id", // Group by proId (unique results)
          proId: { $first: "$proId" }, // Keep first occurrence of proId
          rating: { $first: "$rating" }, // Keep first occurrence of rating
          first_Name: { $first: "$userDetails.first_Name" }, // First occurrence of first_Name
          last_Name: { $first: "$userDetails.last_Name" } // First occurrence of last_Name
        }
      },
      {
        $project: {
          _id: 1, // Remove _id from output
          proId: 1,
          rating: 1,
          first_Name: 1,
          last_Name: 1
        }
      }

    ]);

    if (proService <= 0) {
      return res
        .status(200)
        .json({ status: 200, message: "No pro found to give service." });
    }

    



    return res
      .status(200)
      .json({ status: 200, proService });
  } catch (e) {
   
    return res.status(500).json({ status: 500, message: e.message });
  }
};

export default getProfessional;

