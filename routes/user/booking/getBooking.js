import Joi from "joi";
import { find, getAggregate } from "../../../helpers/index.js";
import mongoose from "mongoose";

const schemaForId = Joi.object().keys({
  id: Joi.string().required(),
});

const schema = Joi.object().keys({
  status: Joi.string(),
});

const booking = async (req, res) => {
  try {
    await schema.validateAsync(req.body);
    await schemaForId.validateAsync(req.params);
    const { id } = req.params;
    const { status } = req.query;
    console.log(status, "staus");
    if (status == "onGoing") {
      const bookService = await getAggregate("userBookServ", [
        // Step 1: Match documents based on userId and status
        {
          $match: {
            userId: new mongoose.Types.ObjectId(id), // Match userId
            status: {
              $in: [
                "Accepted",
                "Pending",
                "Requested",
                "OnGoing",
                "Delivered",
                "Confirmed",
              ],
            }, // Match status
          },
        },

        {
          $lookup: {
            from: "subcategories", // Join with "users" collection
            let: { subCategoryId: { $toObjectId: "$subCategories.id" } }, // Extract professsionalId
            pipeline: [
              {
                $match: {
                  $expr: { $eq: ["$_id", "$$subCategoryId"] },
                }, // Compare userId with _id in users collection
              },
              {
                $project: {
                  categoryName: 1,
                  name: 1,
                  _id: 0,
                }, // Return only required fields
              },
            ],
            as: "procategories",
          },
        },
        {
          $lookup: {
            from: "users", // Join with "users" collection
            let: { professionalId: { $toObjectId: "$professionalId" } }, // Extract professsionalId
            pipeline: [
              {
                $match: {
                  $expr: { $eq: ["$_id", "$$professionalId"] },
                }, // Compare userId with _id in users collection
              },
              {
                $project: {
                  first_Name: 1,
                  last_Name: 1,
                  avgReviewsPro: 1,
                  totalReviewsPro: 1,
                  businessname: 1,
                  businessaddress: 1,
                  businessphoneNo: 1,
                  longitude: 1,
                  latitude: 1,
                  _id: 1,
                }, // Return only required fields
              },
            ],
            as: "proDetails",
          },
        },
        {
          $lookup: {
            from: "tokens", // Join with "users" collection
            let: { professionalId: { $toObjectId: "$professionalId" } }, // Extract professsionalId
            pipeline: [
              {
                $match: {
                  $expr: { $eq: ["$user_id", "$$professionalId"] },
                }, // Compare userId with _id in users collection
              },
              {
                $project: {
                  user_id: 1,
                  fcmToken: 1,
                }, // Return only required fields
              },
            ],
            as: "proFcmToken",
          },
        },
        {
          $lookup: {
            from: "tokens", // Join with "users" collection
            let: { userId: { $toObjectId: "$userId" } }, // Extract professsionalId
            pipeline: [
              {
                $match: {
                  $expr: { $eq: ["$user_id", "$$userId"] },
                }, // Compare userId with _id in users collection
              },
              {
                $project: {
                  user_id: 1,
                  fcmToken: 1,
                }, // Return only required fields
              },
            ],
            as: "userFcmToken",
          },
        },
        {
          $lookup: {
            from: "probookingservices", // Join with "users" collection
            let: { professionalId: { $toObjectId: "$professionalId" } }, // Extract professsionalId
            pipeline: [
              {
                $match: {
                  $expr: { $eq: ["$professsionalId", "$$professionalId"] },
                }, // Compare userId with _id in users collection
              },
              {
                $project: {
                  _id: 1,
                  service_fee: 1,
                  tax_fee: 1,
                  total_amount: 1,
                  total_amount_cus_pay: 1,
                }, // Return only required fields
              },
            ],
            as: "bookingAmount",
          },
        },
        {
          $lookup: {
            from: "addresses", // Join with "users" collection
            let: { addressId: { $toObjectId: "$addressId" } }, // Extract professsionalId
            pipeline: [
              {
                $match: {
                  $expr: { $eq: ["$_id", "$$addressId"] },
                }, // Compare userId with _id in users collection
              },
              {
                $project: {
                  longitude: 1,
                  latitude: 1,
                  _id: 0,
                }, // Return only required fields
              },
            ],
            as: "userAddress",
          },
        },
        {
          $lookup: {
            from: "reviews", // Join with "users" collection
            let: { id: { $toObjectId: "$_id" } }, // Extract professsionalId
            pipeline: [
              {
                $match: {
                  $expr: { $eq: ["$bookServiceId", "$$id"] },
                }, // Compare userId with _id in users collection
              },
              {
                $project: {
                  _id: 1,
                  userId: 1,
                  professsionalId: 1,
                  bookServiceId: 1,
                  comment: 1,
                  reviewStar: 1,
                  status: 1,
                  role: 1,
                  created_date: 1,
                  createdAt: 1,
                  updatedAt: 1,
                }, // Return only required fields
              },
            ],
            as: "userReviews",
          },
        },
      ]);

      if (!bookService || bookService.length == 0) {
        return res
          .status(200)
          .json({ status: 200, message: "No Booking Found!" });
      }

      return res.status(200).json({ status: 200, bookService });
    } else {
      const bookService = await getAggregate("userBookServ", [
        // Step 1: Match documents based on userId and status
        {
          $match: {
            userId: new mongoose.Types.ObjectId(id), // Match userId
            status: { $in: ["Cancelled", "Rejected", "Completed"] }, // Match status
          },
        },

        {
          $lookup: {
            from: "subcategories", // Join with "users" collection
            let: { subCategoryId: { $toObjectId: "$subCategories.id" } }, // Extract professsionalId
            pipeline: [
              {
                $match: {
                  $expr: { $eq: ["$_id", "$$subCategoryId"] },
                }, // Compare userId with _id in users collection
              },
              {
                $project: {
                  categoryName: 1,
                  name: 1,
                  _id: 0,
                }, // Return only required fields
              },
            ],
            as: "procategories",
          },
        },
        {
          $lookup: {
            from: "tokens", // Join with "users" collection
            let: { professionalId: { $toObjectId: "$professionalId" } }, // Extract professsionalId
            pipeline: [
              {
                $match: {
                  $expr: { $eq: ["$user_id", "$$professionalId"] },
                }, // Compare userId with _id in users collection
              },
              {
                $project: {
                  user_id: 1,
                  fcmToken: 1,
                }, // Return only required fields
              },
            ],
            as: "proFcmToken",
          },
        },
        {
          $lookup: {
            from: "tokens", // Join with "users" collection
            let: { userId: { $toObjectId: "$userId" } }, // Extract professsionalId
            pipeline: [
              {
                $match: {
                  $expr: { $eq: ["$user_id", "$$userId"] },
                }, // Compare userId with _id in users collection
              },
              {
                $project: {
                  user_id: 1,
                  fcmToken: 1,
                }, // Return only required fields
              },
            ],
            as: "userFcmToken",
          },
        },
        {
          $lookup: {
            from: "users", // Join with "users" collection
            let: { professionalId: { $toObjectId: "$professionalId" } }, // Extract professsionalId
            pipeline: [
              {
                $match: {
                  $expr: { $eq: ["$_id", "$$professionalId"] },
                }, // Compare userId with _id in users collection
              },
              {
                $project: {
                  first_Name: 1,
                  last_Name: 1,
                  avgReviewsPro: 1,
                  totalReviewsPro: 1,
                  businessname: 1,
                  businessaddress: 1,
                  businessphoneNo: 1,
                  longitude: 1,
                  latitude: 1,
                  _id: 0,
                }, // Return only required fields
              },
            ],
            as: "proDetails",
          },
        },
        {
          $lookup: {
            from: "probookingservices", // Join with "users" collection
            let: { professionalId: { $toObjectId: "$professionalId" } }, // Extract professsionalId
            pipeline: [
              {
                $match: {
                  $expr: { $eq: ["$professsionalId", "$$professionalId"] },
                }, // Compare userId with _id in users collection
              },
              {
                $project: {
                  _id: 1,
                  service_fee: 1,
                  tax_fee: 1,
                  total_amount: 1,
                  total_amount_cus_pay: 1,
                }, // Return only required fields
              },
            ],
            as: "bookingAmount",
          },
        },
        {
          $lookup: {
            from: "addresses", // Join with "users" collection
            let: { addressId: { $toObjectId: "$addressId" } }, // Extract professsionalId
            pipeline: [
              {
                $match: {
                  $expr: { $eq: ["$_id", "$$addressId"] },
                }, // Compare userId with _id in users collection
              },
              {
                $project: {
                  longitude: 1,
                  latitude: 1,
                  _id: 0,
                }, // Return only required fields
              },
            ],
            as: "userAddress",
          },
        },
         {
          $lookup: {
            from: "reviews", // Join with "users" collection
            let: { id: { $toObjectId: "$_id" } }, // Extract professsionalId
            pipeline: [
              {
                $match: {
                  $expr: { $eq: ["$bookServiceId", "$$id"] },
                }, // Compare userId with _id in users collection
              },
              {
                $project: {
                  _id: 1,
                  userId: 1,
                  professsionalId: 1,
                  bookServiceId: 1,
                  comment: 1,
                  reviewStar: 1,
                  status: 1,
                  role: 1,
                  created_date: 1,
                  createdAt: 1,
                  updatedAt: 1,
                }, // Return only required fields
              },
            ],
            as: "userReviews",
          },
        },
      ]);

      if (!bookService || bookService.length == 0) {
        return res
          .status(200)
          .json({ status: 200, message: "No Booking Found!" });
      }

      return res.status(200).json({ status: 200, bookService });
    }
  } catch (e) {
    console.log(e);
    return res.status(400).json({ status: 400, message: e.message });
  }
};

export default booking;
