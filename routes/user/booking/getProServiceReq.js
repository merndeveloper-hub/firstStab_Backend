import Joi from "joi";
import { getAggregate } from "../../../helpers/index.js";
import mongoose from "mongoose";

const schema = Joi.object().keys({
  id: Joi.string().required(),
});

const proServiceRequest = async (req, res) => {
  try {
    await schema.validateAsync(req.params);

    const { id } = req.params;

    const getProBookService = await getAggregate("proBookingService", [
  
        {
          $match: {
            bookServiceId: new mongoose.Types.ObjectId(id),
            status: "Accepted",
          },
        },
        {
          $lookup: {
            from: "users", // Join with "users" collection
            let: { professsionalId: { $toObjectId: "$professsionalId" } }, // Extract professsionalId
            pipeline: [
              {
                $match: {
                  $expr: { $eq: ["$_id", "$$professsionalId"] },
                }, // Compare userId with _id in users collection
              },
              {
                $project: {
                  first_Name: 1,
                  last_Name: 1,
                  avgReviewsPro: 1,
                  totalReviewsPro: 1,
                  quoteAmount: 1,
                  _id: 0,
                }, // Return only required fields
              },
            ],
            as: "proDetails",
          },
        },
        {
          $lookup: {
            from: "subcategories", // Join with "users" collection
            let: { subCategoryId: { $toObjectId: "$subCategoryId" } }, // Extract professsionalId
            pipeline: [
              {
                $match: {
                  $expr: { $eq: ["$_id", "$$subCategoryId"] },
                }, // Compare userId with _id in users collection
              },
              {
                $project: {
                  categoryName:1,
                  name: 1,  
                  _id: 0,
                }, // Return only required fields
              },
            ],
            as: "procategories",
          },
        }
     

        // {
        //   $lookup: {
        //     from: "categories", // Join with "categories" collection
        //     let: { categoryId: { $toObjectId: "$proCategoriesDetails.categoryId" } }, // Extract categoryId
        //     pipeline: [
        //       {
        //         $match: {
        //           $expr: { $eq: ["$_id", "$$categoryId"] },
        //         }, // Compare categoryId with _id in categories collection
        //       },
        //       {
        //         $project: {
        //           categoryName: 1, // Extract categoryName
        //           _id: 0,
        //         },
        //       },
        //     ],
        //     as: "categoryDetails",
        //   },
        // },

        // {
        //   $unwind: "$categoryDetails", // Unwind categoryDetails array
        // },
        // {
        //   $lookup: {
        //     from: "subcategories", // Join with "subcategories" collection
        //     let: { subCategoryId: { $toObjectId: "$proCategoriesDetails.subCategories.id" } }, // Extract subCategoryId
        //     pipeline: [
        //       {
        //         $match: {
        //           $expr: { $eq: ["$_id", "$$subCategoryId"] },
        //         }, // Compare subCategoryId with _id in subcategories collection
        //       },
        //       {
        //         $project: {
        //           subCategoryName: 1, // Extract subCategoryName
        //           _id: 0,
        //         },
        //       },
        //     ],
        //     as: "subCategoryDetails",
        //   },
        // },
        // {
        //   $unwind: "$subCategoryDetails", // Unwind subCategoryDetails array
        // },
        // {
        //   $project: {
        //     proDetails: 1, // Professional details
        //     proCategoriesDetails: 1, // ProCategories details
        //     categoryName: "$categoryDetails.categoryName", // Extracted categoryName
        //     subCategoryName: "$subCategoryDetails.subCategoryName", // Extracted subCategoryName
        //   },
        // },
      
        // },
        // {
        //   $unwind: "$subCategoryDetails", // Unwind subCategoryDetails array
        // },
        // {
        //   $project: {
        //     proDetails: 1, // Professional details
        //     proCategoriesDetails: 1, // ProCategories details
        //     categoryName: "$categoryDetails.categoryName", // Extracted categoryName
        //     subCategoryName: "$subCategoryDetails.subCategoryName", // Extracted subCategoryName
        //   },
        // },
      
      // {
      //   $match: {
      //     bookServiceId: new mongoose.Types.ObjectId(id),
      //     status: "Accepted",
      //   },
      // },
      // {
      //   $lookup: {
      //     from: "users", // Join with "user" collection
      //     let: { professsionalId: { $toObjectId: "$professsionalId" } }, // Extract userId from proBookingService
      //     pipeline: [
      //       {
      //         $match: {
      //           $expr: { $eq: ["$_id", "$$professsionalId"] },
      //         }, // Compare userId with _id in user collection
      //       },
      //       {
      //         $project: {
      //           first_Name: 1,
      //           last_Name: 1,
      //           avgReviewsPro: 1,
      //           totalReviewsPro: 1,
      //           quoteAmount: 1,
      //           _id: 0,
      //         }, // Return only firstName & lastName
      //       },
      //     ],
      //     as: "proDetails",
      //   },
      // },
      // {
      //   $lookup: {
      //     from: "procategories", // Join with "user" collection
      //     let: { proServiceId: { $toObjectId: "$proServiceId" } }, // Extract userId from proBookingService
      //     pipeline: [
      //       {
      //         $match: {
      //           $expr: { $eq: ["$_id", "$$proServiceId"] },
      //         }, // Compare userId with _id in user collection
      //       },
      //     ],
      //     as: "proCategoriesDetails",
      //   },
      // },
  
    ]);
    console.log(getProBookService, "getProBookService");

if(!getProBookService || getProBookService.length == 0){
  return res.status(200).json({ status: 200, message: "No professional quotes available at the moment." });
}

    return res.status(200).json({ status: 200, getProBookService });
  } catch (e) {
    console.log(e);
    return res.status(400).json({ status: 400, message: e.message });
  }
};

export default proServiceRequest;
