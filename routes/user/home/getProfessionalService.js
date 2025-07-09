// import Joi from "joi";
// import { getAggregate, insertNewDocument } from "../../../helpers/index.js";

// import mongoose from "mongoose";

// const schema = Joi.object({
//   categoryId: Joi.string().required(),
//   subCategorieId: Joi.string().required(),
//   servieType: Joi.string().required(),
// });

// const getProfessionalService = async (req, res) => {
//   try {
//     await schema.validateAsync(req.query);
//     const { categoryId, subCategorieId, servieType } = req.query;
// console.log(req.query,"query");

//     const proService = await getAggregate("proCategory", [
//       {
//         $match: { categoryId: new mongoose.Types.ObjectId(categoryId) }, // Match categoryId
//       },
//       {
//         $project: {
//           _id: 1,
//           proId: 1,
//           rating: 1,
//           price:1,
//           categoryId: 1,
//           subCategories: {
//             $filter: {
//               input: "$subCategories",
//               as: "sub",
//               cond: {
//                 $and: [
//                   {
//                     $eq: [
//                       "$$sub.id",
//                       new mongoose.Types.ObjectId(subCategorieId),
//                     ],
//                   }, // Match subCategorieId
//                   { $eq: [`$$sub.${servieType}`, true] }, // Check if serviceType is true
//                 ],
//               },
//             },
//           },
//         },
//       },
//       {
//         $match: { "subCategories.0": { $exists: true } }, // Ensure at least one matching subCategory exists
//       },
//       {
//         $lookup: {
//           from: "users", // Join with users collection
//           localField: "proId",
//           foreignField: "_id",
//           as: "proDetails",
//         },
//       },
//       {
//         $unwind: { path: "$proDetails", preserveNullAndEmptyArrays: true }, // Flatten user details
//       },

//       {
//         $group: {
//           _id: "$_id", // Group by proId (unique results)
//           proId: { $first: "$proId" }, // Keep first occurrence of proId
//           rating: { $first: "$rating" }, // Keep first occurrence of rating
//           price: { $first: "$price" }, // Keep first occurrence of rating
//           avgRating: { $first: "$avgReviewsPro" }, // Keep first occurrence of rating
//           first_Name: { $first: "$proDetails.first_Name" }, // First occurrence of first_Name
//           last_Name: { $first: "$proDetails.last_Name" }, // First occurrence of last_Name
//           badge: { $first: "$proDetails.badge" },
//           totalJobCompleted: { $first: "$proDetails.totalJobCompleted" },
//           totalJobCancelled: { $first: "$proDetails.totalJobCancelled" },
//           totalJob: { $first: "$proDetails.totalJob" },
//           responseRate: { $first: "$proDetails.responseRate" },
//           responseTime: { $first: "$proDetails.responseTime" },
//           availability: { $first: "$proDetails.availability" },
//           bgCheck: { $first: "$proDetails.bgCheck" },
//           totalRating: { $first: "$proDetails.totalRating" },
//           profile: { $first: "$proDetails.profile" },
//           video: { $first: "$proDetails.video" },
//           country: { $first: "$proDetails.country" },
//           state: { $first: "$proDetails.state" },
//         },
//       },
//       {
//         $project: {
//           _id: 1, // Remove _id from output
//           proId: 1,
//           rating: 1,
//           price:1,
//           avgRating:1,
//           first_Name: 1,
//           last_Name: 1,
//           badge:1,
//           totalJobCompleted:1,
//           totalJobCancelled:1,
//           totalJob:1,
//           responseRate:1,
//           responseTime:1,
//           availability:1,
//           bgCheck:1,
//           totalRating:1,
//           profile:1,
//           video:1,
//           country:1,
//           state:1
//         },
//       },
//     ]);

// console.log(proService,"proservice");

//     if (!proService || proService == 0) {
//       return res
//         .status(400)
//         .json({ status: 400, message: "No professionals available for the selected service" });
//     }

//     return res.status(200).json({ status: 200, proService });
//   } catch (e) {
//     console.log("error");

//     return res.status(400).json({ status: 400, message: e.message });
//   }
// };

// export default getProfessionalService;

// //first,last,badge,profile,video,totalJObsCompleted,totalJobscancel,TotalJobs,TotalRating,ALLcATEGORY,ResponseRate,ResponseTime,Availability,bgCheck,deliveryType,Price,location,time

import Joi from "joi";
import mongoose from "mongoose";
import { getAggregate } from "../../../helpers/index.js";

const schema = Joi.object({
  categoryId: Joi.string().required(),
  subCategorieId: Joi.string().required(),
  servieType: Joi.string().required(),
});

const getProfessionalService = async (req, res) => {
  try {
    await schema.validateAsync(req.query);
    const { categoryId, subCategorieId, servieType } = req.query;
    console.log(req.query, "query");

    const proService = await getAggregate("proCategory", [
      {
        $match: {
          categoryId: new mongoose.Types.ObjectId(categoryId),
          status: "Active",
        },
      },
      {
        $project: {
          _id: 1,
          subCategories: 1,
          proId: 1,
          rating: 1,
          complexity_tier: 1,
          price_model: 1,
          fixed_price: 1,
          min_price: 1,
          max_price: 1,
          price: 1,
          categoryId: 1,
          subCategories: {
            $filter: {
              input: "$subCategories",
              as: "sub",
              cond: {
                $and: [
                  {
                    $eq: [
                      "$$sub.id",
                      new mongoose.Types.ObjectId(subCategorieId),
                    ],
                  },
                  { $eq: [`$$sub.${servieType}`, true] },
                ],
              },
            },
          },
        },
      },
      {
        $match: {
          "subCategories.0": { $exists: true },
        },
      },
      {
        $unwind: "$subCategories",
      },
      {
        $lookup: {
          from: "subcategories",
          let: { subCatId: "$subCategories.id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ["$_id", "$$subCatId"],
                },
              },
            },
            {
              $project: {
                categoryName: 1,
                name: 1,
              },
            },
          ],
          as: "subCategoryDetails",
        },
      },
      {
        $unwind: {
          path: "$subCategoryDetails",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "proId",
          foreignField: "_id",
          as: "proDetails",
        },
      },
      {
        $unwind: {
          path: "$proDetails",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "probookingservices",
          localField: "_id",
          foreignField: "proServiceId",
          as: "userBookingStatus",
        },
      },
      {
        $unwind: {
          path: "$userBookingStatus",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $group: {
          _id: "$_id",
          userbookingstatus: { $first: "$userBookingStatus.status" },
          total_amount_cus_pay: {
            $first: "$userBookingStatus.total_amount_cus_pay",
          },
          total_amount: { $first: "$userBookingStatus.total_amount" },
           proBookingServiceId: { $first: "$userBookingStatus._id" },
           userBookServiceId:{ $first: "$userBookingStatus.bookServiceId" },
          tax_fee: { $first: "$userBookingStatus.tax_fee" },
          service_fee: { $first: "$userBookingStatus.service_fee" },
          quoteInfo: { $first: "$userBookingStatus.quoteInfo" },
          quoteDetail: { $first: "$userBookingStatus.quoteDetail" },
          quoteAmount: { $first: "$userBookingStatus.quoteAmount" },
          subCategories: { $first: "$subCategories" },
          proId: { $first: "$proId" },
          rating: { $first: "$rating" },
           complexity_tier: { $first: "$complexity_tier" },
          price_model: { $first: "$price_model" },
          fixed_price: { $first: "$fixed_price" },
          min_price: { $first: "$min_price" },
          max_price: { $first: "$max_price" },
          price: { $first: "$price" },
          categoryId: { $first: "$categoryId" },
          avgRating: { $first: "$avgReviewsPro" },
          first_Name: { $first: "$proDetails.first_Name" },
          last_Name: { $first: "$proDetails.last_Name" },
          badge: { $first: "$proDetails.badge" },
          totalJobCompleted: { $first: "$proDetails.totalJobCompleted" },
          totalJobCancelled: { $first: "$proDetails.totalJobCancelled" },
          totalJob: { $first: "$proDetails.totalJob" },
          responseRate: { $first: "$proDetails.responseRate" },
          responseTime: { $first: "$proDetails.responseTime" },
          availability: { $first: "$proDetails.availability" },
          bgCheck: { $first: "$proDetails.bgCheck" },
          totalRating: { $first: "$proDetails.totalRating" },
          profile: { $first: "$proDetails.profile" },
          video: { $first: "$proDetails.video" },
          country: { $first: "$proDetails.country" },
          state: { $first: "$proDetails.state" },
          time: { $first: "$proDetails.time" },
          businessname: { $first: "$proDetails.businessname" },
          name: { $first: "$subCategoryDetails.name" },
          categoryName: { $first: "$subCategoryDetails.categoryName" },
        },
      },
      {
        $sort: {
          _id: 1, // Replace with createdAt: 1 if you have a timestamp field
        },
      },
      {
        $project: {
          _id: 1,
          userbookingstatus: 1,
          proBookingServiceId:1,
          userBookServiceId:1,
          total_amount_cus_pay: 1,
          total_amount: 1,
          tax_fee: 1,
          service_fee: 1,
          quoteInfo: 1,
          quoteDetail: 1,
          quoteAmount: 1,
          categoryId: 1,
          subCategories: 1,
          proId: 1,
          rating: 1,
           complexity_tier: 1,
          price_model: 1,
          fixed_price: 1,
          min_price: 1,
          max_price: 1,
          price: 1,
          avgRating: 1,
          first_Name: 1,
          last_Name: 1,
          badge: 1,
          totalJobCompleted: 1,
          totalJobCancelled: 1,
          totalJob: 1,
          responseRate: 1,
          responseTime: 1,
          availability: 1,
          bgCheck: 1,
          totalRating: 1,
          profile: 1,
          video: 1,
          country: 1,
          state: 1,
          time: 1,
          name: 1,
          categoryName: 1,
          businessname: 1,
        },
      },
    ]);

    console.log(proService, "proService");

    if (!proService || proService.length === 0) {
      return res.status(400).json({
        status: 400,
        message: "No professionals available for the selected service",
      });
    }
    let serviceTime = process.env.bookingTime;
    return res
      .status(200)
      .json({ status: 200, proService, servieTimer: serviceTime });
  } catch (e) {
    console.log("error", e.message);
    return res.status(400).json({ status: 400, message: e.message });
  }
};

export default getProfessionalService;
