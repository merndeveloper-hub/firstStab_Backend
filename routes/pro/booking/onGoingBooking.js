// import Joi from "joi";
// import { find, findOne, getAggregate } from "../../../helpers/index.js";
// import mongoose from "mongoose";

// const schema = Joi.object().keys({
//   id: Joi.string().required(),
// });

// const getOnGoingBooking = async (req, res) => {
//   try {
//     await schema.validateAsync(req.params);
//     const { id,timezone } = req.params;
//     const { status } = req.query;
//     console.log(status, "staus");
//     const proBookService = await findOne("user", { _id: id });

//     if (!proBookService || proBookService.length == 0) {
//       return res.status(400).json({ status: 400, message: "User Not Found" });
//     }
//     if (status == "onGoing") {
//       const getProBookService = await getAggregate("proBookingService", [
//         {
//           $match: {
//             professsionalId: new mongoose.Types.ObjectId(id),
//             status: { $in: ["Accepted", "Pending", "Approved","Delivered","Requested","Confirmed"] },
//           },
//         },
//         {
//           $lookup: {
//             from: "users", // Join with "user" collection
//             let: { userId: { $toObjectId: "$userId" } }, // Extract userId from proBookingService
//             pipeline: [
//               {
//                 $match: {
//                   $expr: { $eq: ["$_id", "$$userId"] },
//                 }, // Compare userId with _id in user collection
//               },
//               {
//                 $project: { first_Name: 1, last_Name: 1, _id: 0 }, // Return only firstName & lastName
//               },
//             ],
//             as: "userDetails",
//           },
//         },
//         {
//           $lookup: {
//             from: "addresses", // Join with "users" collection
//             let: { addressId: { $toObjectId: "$addressId" } }, // Extract professsionalId
//             pipeline: [
//               {
//                 $match: {
//                   $expr: { $eq: ["$_id", "$$addressId"] },
//                 }, // Compare userId with _id in users collection
//               },
//               {
//                 $project: {
//                   longitude: 1,
//                   latitude: 1,
//                   _id: 0,
//                 }, // Return only required fields
//               },
//             ],
//             as: "userAddress",
//           },
//         },
//         {
//           $lookup: {
//             from: "users", // Join with "user" collection
//             let: { professsionalId: { $toObjectId: "$professsionalId" } }, // Extract userId from proBookingService
//             pipeline: [
//               {
//                 $match: {
//                   $expr: { $eq: ["$_id", "$$professsionalId"] },
//                 }, // Compare userId with _id in user collection
//               },
//               {
//                 $project: { businessname: 1, totalReviewsPro: 1, avgReviewsPro: 1,first_Name:1,last_Name:1,  longitude: 1,
//                   latitude: 1,}, // Return only firstName & lastName
//               },
//             ],
//             as: "proDetails",
//           },
//         },
//          {
//           $lookup: {
//             from: "tokens", // Join with "user" collection
//             let: { professsionalId: { $toObjectId: "$professsionalId" } }, // Extract userId from proBookingService
//             pipeline: [
//               {
//                 $match: {
//                   $expr: { $eq: ["$user_id", "$$professsionalId"] },
//                 }, // Compare userId with _id in user collection
//               },
//               {
//                 $project: { user_id: 1,fcmToken:1}, // Return only firstName & lastName
//               },
//             ],
//             as: "proFcmToken",
//           },
//         },
//          {
//           $lookup: {
//             from: "tokens", // Join with "user" collection
//             let: { userId: { $toObjectId: "$userId" } }, // Extract userId from proBookingService
//             pipeline: [
//               {
//                 $match: {
//                   $expr: { $eq: ["$user_id", "$$userId"] },
//                 }, // Compare userId with _id in user collection
//               },
//               {
//                 $project: { user_id: 1,fcmToken:1}, // Return only firstName & lastName
//               },
//             ],
//             as: "userFcmToken",
//           },
//         },
//            {
//           $lookup: {
//             from: "reviews", // Join with "users" collection
//             let: { bookServiceId: { $toObjectId: "$bookServiceId" } }, // Extract professsionalId
//             pipeline: [
//               {
//                 $match: {
//                   $expr: { $eq: ["$bookServiceId", "$$bookServiceId"] },
//                 }, // Compare userId with _id in users collection
//               },
//               {
//                 $project: {
//                   _id: 1,
//                   userId: 1,
//                   professsionalId: 1,
//                   bookServiceId: 1,
//                   comment: 1,
//                   reviewStar: 1,
//                   status: 1,
//                   role: 1,
//                   created_date: 1,
//                   createdAt: 1,
//                   updatedAt: 1,
//                 }, // Return only required fields
//               },
//             ],
//             as: "proReviews",
//           },
//         },
//         {
//           $lookup: {
//             from: "subcategories", // Join with "users" collection
//             let: { subCategoryId: { $toObjectId: "$subCategoryId" } }, // Extract professsionalId
//             pipeline: [
//               {
//                 $match: {
//                   $expr: { $eq: ["$_id", "$$subCategoryId"] },
//                 }, // Compare userId with _id in users collection
//               },
//               {
//                 $project: {
//                   categoryName: 1,
//                   name: 1,
//                   _id: 0,
//                 }, // Return only required fields
//               },
//             ],
//             as: "procategories",
//           },
//         },
//         {
//           $addFields: {
//             subCategories: {
//               serviceType: "$serviceType", // Use the serviceType field from proBookService
//             },
//           },
//         },
//       ]);

//       console.log(getProBookService, "getProBookService");

//       if (!getProBookService || getProBookService.length == 0) {
//         return res
//           .status(200)
//           .json({ status: 200, message: "No New Service Request Found!" });
//       }

//       return res.status(200).json({ status: 200, getProBookService });
//     } else {
//       const getProBookService = await getAggregate("proBookingService", [
//         {
//           $match: {
//             professsionalId: new mongoose.Types.ObjectId(id),
//             status: { $in: ["Cancelled", "Completed"] },
//           },
//         },
//         {
//           $lookup: {
//             from: "users", // Join with "user" collection
//             let: { userId: { $toObjectId: "$userId" } }, // Extract userId from proBookingService
//             pipeline: [
//               {
//                 $match: {
//                   $expr: { $eq: ["$_id", "$$userId"] },
//                 }, // Compare userId with _id in user collection
//               },
//               {
//                 $project: { first_Name: 1, last_Name: 1, _id: 0 }, // Return only firstName & lastName
//               },
//             ],
//             as: "userDetails",
//           },
//         },  {
//           $lookup: {
//             from: "tokens", // Join with "user" collection
//             let: { professsionalId: { $toObjectId: "$professsionalId" } }, // Extract userId from proBookingService
//             pipeline: [
//               {
//                 $match: {
//                   $expr: { $eq: ["$user_id", "$$professsionalId"] },
//                 }, // Compare userId with _id in user collection
//               },
//               {
//                 $project: { user_id: 1,fcmToken:1}, // Return only firstName & lastName
//               },
//             ],
//             as: "proFcmToken",
//           },
//         },
//          {
//           $lookup: {
//             from: "tokens", // Join with "user" collection
//             let: { userId: { $toObjectId: "$userId" } }, // Extract userId from proBookingService
//             pipeline: [
//               {
//                 $match: {
//                   $expr: { $eq: ["$user_id", "$$userId"] },
//                 }, // Compare userId with _id in user collection
//               },
//               {
//                 $project: { user_id: 1,fcmToken:1}, // Return only firstName & lastName
//               },
//             ],
//             as: "userFcmToken",
//           },
//         },
//         {
//           $lookup: {
//             from: "addresses", // Join with "users" collection
//             let: { addressId: { $toObjectId: "$addressId" } }, // Extract professsionalId
//             pipeline: [
//               {
//                 $match: {
//                   $expr: { $eq: ["$_id", "$$addressId"] },
//                 }, // Compare userId with _id in users collection
//               },
//               {
//                 $project: {
//                   longitude: 1,
//                   latitude: 1,
//                   _id: 0,
//                 }, // Return only required fields
//               },
//             ],
//             as: "userAddress",
//           },
//         },
//         {
//           $lookup: {
//             from: "users", // Join with "user" collection
//             let: { professsionalId: { $toObjectId: "$professsionalId" } }, // Extract userId from proBookingService
//             pipeline: [
//               {
//                 $match: {
//                   $expr: { $eq: ["$_id", "$$professsionalId"] },
//                 }, // Compare userId with _id in user collection
//               },
//               {
//                 $project: { businessname: 1, totalReviewsPro: 1, avgReviewsPro: 1,first_Name:1,last_Name:1, longitude: 1,
//                   latitude: 1, }, // Return only firstName & lastName
//               },
//             ],
//             as: "proDetails",
//           },
//         },
//              {
//           $lookup: {
//             from: "reviews", // Join with "users" collection
//             let: { bookServiceId: { $toObjectId: "$bookServiceId" } }, // Extract professsionalId
//             pipeline: [
//               {
//                 $match: {
//                   $expr: { $eq: ["$bookServiceId", "$$bookServiceId"] },
//                 }, // Compare userId with _id in users collection
//               },
//               {
//                 $project: {
//                   _id: 1,
//                   userId: 1,
//                   professsionalId: 1,
//                   bookServiceId: 1,
//                   comment: 1,
//                   reviewStar: 1,
//                   status: 1,
//                   role: 1,
//                   created_date: 1,
//                   createdAt: 1,
//                   updatedAt: 1,
//                 }, // Return only required fields
//               },
//             ],
//             as: "proReviews",
//           },
//         },
//         {
//           $lookup: {
//             from: "subcategories", // Join with "users" collection
//             let: { subCategoryId: { $toObjectId: "$subCategoryId" } }, // Extract professsionalId
//             pipeline: [
//               {
//                 $match: {
//                   $expr: { $eq: ["$_id", "$$subCategoryId"] },
//                 }, // Compare userId with _id in users collection
//               },
//               {
//                 $project: {
//                   categoryName: 1,
//                   name: 1,
//                   _id: 0,
//                 }, // Return only required fields
//               },
//             ],
//             as: "procategories",
//           },
//         },
//         {
//           $addFields: {
//             subCategories: {
//               serviceType: "$serviceType", // Use the serviceType field from proBookService
//             },
//           },
//         },
//       ]);

//       console.log(getProBookService, "getProBookService");

//       if (!getProBookService || getProBookService.length == 0) {
//         return res
//           .status(200)
//           .json({ status: 200, message: "No New Service Request Found!" });
//       }

//       return res.status(200).json({ status: 200, getProBookService });
//     }
//   } catch (e) {
//     console.log(e);
//     return res.status(500).json({ status: 500, message: e.message });
//   }
// };

// export default getOnGoingBooking;


import Joi from "joi";
import { findOne, getAggregate } from "../../../helpers/index.js";
import { convertFromUTC } from "../../../utils/index.js";
import mongoose from "mongoose";

const schema = Joi.object().keys({
  id: Joi.string().hex().length(24).required(),
});

const querySchema = Joi.object().keys({
  status: Joi.string().optional(),
  timezone: Joi.string().required(), // ✅ Required timezone
});

/**
 * Convert all booking times from UTC to professional's timezone
 */
const convertBookingTimes = (booking, targetTimezone) => {
  const converted = { ...booking };

  try {
    // Convert order start time (stored at root level in proBookingService)
    if (booking.orderStartDate && booking.orderStartTime) {
      const localStart = convertFromUTC(
        booking.orderStartDate,
        booking.orderStartTime,
        targetTimezone
      );
      if (localStart) {
        converted.displayStartDate = localStart.localDate;
        converted.displayStartTime = localStart.localTime;
        converted.displayStartDateTime = localStart.localDateTime;
      }
    }

    // Convert order end time
    if (booking.orderEndDate && booking.orderEndTime) {
      const localEnd = convertFromUTC(
        booking.orderEndDate,
        booking.orderEndTime,
        targetTimezone
      );
      if (localEnd) {
        converted.displayEndDate = localEnd.localDate;
        converted.displayEndTime = localEnd.localTime;
        converted.displayEndDateTime = localEnd.localDateTime;
      }
    }

    // Convert cancel time
    if (booking.CancelDate && booking.CancelTime) {
      const localCancel = convertFromUTC(
        booking.CancelDate,
        booking.CancelTime,
        targetTimezone
      );
      if (localCancel) {
        converted.displayCancelDate = localCancel.localDate;
        converted.displayCancelTime = localCancel.localTime;
        converted.displayCancelDateTime = localCancel.localDateTime;
      }
    }

    // Convert completion/delivery time
    if (booking.FinishedDate && booking.FinishedTime) {
      const localComplete = convertFromUTC(
        booking.FinishedDate,
        booking.FinishedTime,
        targetTimezone
      );
      if (localComplete) {
        converted.displayCompletionDate = localComplete.localDate;
        converted.displayCompletionTime = localComplete.localTime;
        converted.displayCompletionDateTime = localComplete.localDateTime;
      }
    }

    // Convert reschedule request time
    if (booking.orderRescheduleStartDate && booking.orderRescheduleStartTime) {
      const localReschedule = convertFromUTC(
        booking.orderRescheduleStartDate,
        booking.orderRescheduleStartTime,
        targetTimezone
      );
      if (localReschedule) {
        converted.displayRescheduleDate = localReschedule.localDate;
        converted.displayRescheduleTime = localReschedule.localTime;
        converted.displayRescheduleDateTime = localReschedule.localDateTime;
      }
    }

    // Add timezone metadata
    converted.displayTimezone = targetTimezone;
    converted.storedInUTC = true;

  } catch (error) {
    console.error("Error converting booking times:", error);
  }

  return converted;
};

const getProBookings = async (req, res) => {
  try {
    await schema.validateAsync(req.params);
    await querySchema.validateAsync(req.query);

    const { id,timezone } = req.params;
    const { status } = req.query;

    console.log("📋 Get Pro Bookings:", { proId: id, status, timezone });

    // Verify professional exists
    const proUser = await findOne("user", { _id: id });
    if (!proUser) {
      return res.status(400).json({ status: 400, message: "User Not Found" });
    }

    // Determine which statuses to fetch
    let statusFilter;
    if (status === "onGoing") {
      statusFilter = {
        $in: ["Accepted", "Pending", "Approved", "Delivered", "Requested", "Confirmed"],
      };
    } else {
      statusFilter = {
        $in: ["Cancelled", "Completed"],
      };
    }

    // Fetch bookings with aggregation
    const getProBook = await getAggregate("proBookingService", [
      // Match professional's bookings
      {
        $match: {
          professsionalId: new mongoose.Types.ObjectId(id),
          status: statusFilter,
        },
      },

      // Lookup user details
      {
        $lookup: {
          from: "users",
          let: { userId: { $toObjectId: "$userId" } },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$_id", "$$userId"] },
              },
            },
            {
              $project: {
                first_Name: 1,
                last_Name: 1,
                _id: 0,
              },
            },
          ],
          as: "userDetails",
        },
      },

      // Lookup user address
      {
        $lookup: {
          from: "addresses",
          let: { addressId: { $toObjectId: "$addressId" } },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$_id", "$$addressId"] },
              },
            },
            {
              $project: {
                longitude: 1,
                latitude: 1,
                _id: 0,
              },
            },
          ],
          as: "userAddress",
        },
      },

      // Lookup professional details
      {
        $lookup: {
          from: "users",
          let: { professsionalId: { $toObjectId: "$professsionalId" } },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$_id", "$$professsionalId"] },
              },
            },
            {
              $project: {
                businessname: 1,
                totalReviewsPro: 1,
                avgReviewsPro: 1,
                first_Name: 1,
                last_Name: 1,
                longitude: 1,
                latitude: 1,
              },
            },
          ],
          as: "proDetails",
        },
      },

      // Lookup professional FCM token
      {
        $lookup: {
          from: "tokens",
          let: { professsionalId: { $toObjectId: "$professsionalId" } },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$user_id", "$$professsionalId"] },
              },
            },
            {
              $project: {
                user_id: 1,
                fcmToken: 1,
              },
            },
          ],
          as: "proFcmToken",
        },
      },

      // Lookup user FCM token
      {
        $lookup: {
          from: "tokens",
          let: { userId: { $toObjectId: "$userId" } },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$user_id", "$$userId"] },
              },
            },
            {
              $project: {
                user_id: 1,
                fcmToken: 1,
              },
            },
          ],
          as: "userFcmToken",
        },
      },

      // Lookup reviews
      {
        $lookup: {
          from: "reviews",
          let: { bookServiceId: { $toObjectId: "$bookServiceId" } },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$bookServiceId", "$$bookServiceId"] },
              },
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
              },
            },
          ],
          as: "proReviews",
        },
      },

      // Lookup subcategories
      {
        $lookup: {
          from: "subcategories",
          let: { subCategoryId: { $toObjectId: "$subCategoryId" } },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$_id", "$$subCategoryId"] },
              },
            },
            {
              $project: {
                categoryName: 1,
                name: 1,
                _id: 0,
              },
            },
          ],
          as: "procategories",
        },
      },

      // Add service type to subCategories field
      {
        $addFields: {
          subCategories: {
            serviceType: "$serviceType",
          },
        },
      },

      // Sort by creation date (newest first)
      {
        $sort: { createdAt: -1 },
      },
    ]);

    if (!getProBook || getProBook.length === 0) {
      return res.status(200).json({
        status: 200,
        message: "No Service Request Found!",
        bookings: [],
        timezone: timezone,
      });
    }

    // ✅ Convert all booking times to professional's timezone
    const getProBookService = getProBook.map((booking) =>
      convertBookingTimes(booking, timezone)
    );

    console.log(`✅ Found ${getProBookService.length} bookings for professional`);

    return res.status(200).json({
      status: 200,
      message: "Bookings retrieved successfully",
    //  count: convertedBookings.length,
    //  timezone: timezone,
    //  getProBookService: convertedBookings,
    getProBookService
    });
  } catch (e) {
    console.error("❌ Get Pro Bookings Error:", e);
    return res.status(500).json({ status: 500, message: e.message });
  }
};

export default getProBookings;