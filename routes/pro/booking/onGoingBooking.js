import Joi from "joi";
import { find, findOne, getAggregate } from "../../../helpers/index.js";
import mongoose from "mongoose";

const schema = Joi.object().keys({
  id: Joi.string().required(),
});

const getOnGoingBooking = async (req, res) => {
  try {
    await schema.validateAsync(req.params);
    const { id,timezone } = req.params;
    const { status } = req.query;
    console.log(status, "staus");
    const proBookService = await findOne("user", { _id: id });

    if (!proBookService || proBookService.length == 0) {
      return res.status(400).json({ status: 400, message: "User Not Found" });
    }
    if (status == "onGoing") {
      const getProBookService = await getAggregate("proBookingService", [
        {
          $match: {
            professsionalId: new mongoose.Types.ObjectId(id),
            status: { $in: ["Accepted", "Pending", "Approved","Delivered","Requested","Confirmed"] },
          },
        },
        {
          $lookup: {
            from: "users", // Join with "user" collection
            let: { userId: { $toObjectId: "$userId" } }, // Extract userId from proBookingService
            pipeline: [
              {
                $match: {
                  $expr: { $eq: ["$_id", "$$userId"] },
                }, // Compare userId with _id in user collection
              },
              {
                $project: { first_Name: 1, last_Name: 1, _id: 0 }, // Return only firstName & lastName
              },
            ],
            as: "userDetails",
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
            from: "users", // Join with "user" collection
            let: { professsionalId: { $toObjectId: "$professsionalId" } }, // Extract userId from proBookingService
            pipeline: [
              {
                $match: {
                  $expr: { $eq: ["$_id", "$$professsionalId"] },
                }, // Compare userId with _id in user collection
              },
              {
                $project: { businessname: 1, totalReviewsPro: 1, avgReviewsPro: 1,first_Name:1,last_Name:1,  longitude: 1,
                  latitude: 1,}, // Return only firstName & lastName
              },
            ],
            as: "proDetails",
          },
        },
         {
          $lookup: {
            from: "tokens", // Join with "user" collection
            let: { professsionalId: { $toObjectId: "$professsionalId" } }, // Extract userId from proBookingService
            pipeline: [
              {
                $match: {
                  $expr: { $eq: ["$user_id", "$$professsionalId"] },
                }, // Compare userId with _id in user collection
              },
              {
                $project: { user_id: 1,fcmToken:1}, // Return only firstName & lastName
              },
            ],
            as: "proFcmToken",
          },
        },
         {
          $lookup: {
            from: "tokens", // Join with "user" collection
            let: { userId: { $toObjectId: "$userId" } }, // Extract userId from proBookingService
            pipeline: [
              {
                $match: {
                  $expr: { $eq: ["$user_id", "$$userId"] },
                }, // Compare userId with _id in user collection
              },
              {
                $project: { user_id: 1,fcmToken:1}, // Return only firstName & lastName
              },
            ],
            as: "userFcmToken",
          },
        },
           {
          $lookup: {
            from: "reviews", // Join with "users" collection
            let: { bookServiceId: { $toObjectId: "$bookServiceId" } }, // Extract professsionalId
            pipeline: [
              {
                $match: {
                  $expr: { $eq: ["$bookServiceId", "$$bookServiceId"] },
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
            as: "proReviews",
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
          $addFields: {
            subCategories: {
              serviceType: "$serviceType", // Use the serviceType field from proBookService
            },
          },
        },
      ]);

      console.log(getProBookService, "getProBookService");

      if (!getProBookService || getProBookService.length == 0) {
        return res
          .status(200)
          .json({ status: 200, message: "No New Service Request Found!" });
      }

      return res.status(200).json({ status: 200, getProBookService });
    } else {
      const getProBookService = await getAggregate("proBookingService", [
        {
          $match: {
            professsionalId: new mongoose.Types.ObjectId(id),
            status: { $in: ["Cancelled", "Completed"] },
          },
        },
        {
          $lookup: {
            from: "users", // Join with "user" collection
            let: { userId: { $toObjectId: "$userId" } }, // Extract userId from proBookingService
            pipeline: [
              {
                $match: {
                  $expr: { $eq: ["$_id", "$$userId"] },
                }, // Compare userId with _id in user collection
              },
              {
                $project: { first_Name: 1, last_Name: 1, _id: 0 }, // Return only firstName & lastName
              },
            ],
            as: "userDetails",
          },
        },  {
          $lookup: {
            from: "tokens", // Join with "user" collection
            let: { professsionalId: { $toObjectId: "$professsionalId" } }, // Extract userId from proBookingService
            pipeline: [
              {
                $match: {
                  $expr: { $eq: ["$user_id", "$$professsionalId"] },
                }, // Compare userId with _id in user collection
              },
              {
                $project: { user_id: 1,fcmToken:1}, // Return only firstName & lastName
              },
            ],
            as: "proFcmToken",
          },
        },
         {
          $lookup: {
            from: "tokens", // Join with "user" collection
            let: { userId: { $toObjectId: "$userId" } }, // Extract userId from proBookingService
            pipeline: [
              {
                $match: {
                  $expr: { $eq: ["$user_id", "$$userId"] },
                }, // Compare userId with _id in user collection
              },
              {
                $project: { user_id: 1,fcmToken:1}, // Return only firstName & lastName
              },
            ],
            as: "userFcmToken",
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
            from: "users", // Join with "user" collection
            let: { professsionalId: { $toObjectId: "$professsionalId" } }, // Extract userId from proBookingService
            pipeline: [
              {
                $match: {
                  $expr: { $eq: ["$_id", "$$professsionalId"] },
                }, // Compare userId with _id in user collection
              },
              {
                $project: { businessname: 1, totalReviewsPro: 1, avgReviewsPro: 1,first_Name:1,last_Name:1, longitude: 1,
                  latitude: 1, }, // Return only firstName & lastName
              },
            ],
            as: "proDetails",
          },
        },
             {
          $lookup: {
            from: "reviews", // Join with "users" collection
            let: { bookServiceId: { $toObjectId: "$bookServiceId" } }, // Extract professsionalId
            pipeline: [
              {
                $match: {
                  $expr: { $eq: ["$bookServiceId", "$$bookServiceId"] },
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
            as: "proReviews",
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
          $addFields: {
            subCategories: {
              serviceType: "$serviceType", // Use the serviceType field from proBookService
            },
          },
        },
      ]);

      console.log(getProBookService, "getProBookService");

      if (!getProBookService || getProBookService.length == 0) {
        return res
          .status(200)
          .json({ status: 200, message: "No New Service Request Found!" });
      }

      return res.status(200).json({ status: 200, getProBookService });
    }
  } catch (e) {
    console.log(e);
    return res.status(500).json({ status: 500, message: e.message });
  }
};

export default getOnGoingBooking;
