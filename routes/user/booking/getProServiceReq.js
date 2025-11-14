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


// import Joi from "joi";
// import { find, getAggregate } from "../../../helpers/index.js";
// import { convertFromUTC } from "../../../utils/index.js";
// import mongoose from "mongoose";

// const schemaForId = Joi.object().keys({
//   id: Joi.string().hex().length(24).required(),
// });

// const schema = Joi.object().keys({
//   status: Joi.string().optional(),
//   timezone: Joi.string().required(), // ✅ Required timezone
// });

// /**
//  * Convert all booking times from UTC to user's timezone
//  */
// const convertBookingTimes = (booking, targetTimezone) => {
//   const converted = { ...booking };

//   try {
//     // Convert order start time
//     if (booking.subCategories?.orderStartDate && booking.subCategories?.orderStartTime) {
//       const localStart = convertFromUTC(
//         booking.subCategories.orderStartDate,
//         booking.subCategories.orderStartTime,
//         targetTimezone
//       );
//       if (localStart) {
//         converted.displayStartDate = localStart.localDate;
//         converted.displayStartTime = localStart.localTime;
//         converted.displayStartDateTime = localStart.localDateTime;
//       }
//     }

//     // Convert order end time
//     if (booking.subCategories?.orderEndDate && booking.subCategories?.orderEndTime) {
//       const localEnd = convertFromUTC(
//         booking.subCategories.orderEndDate,
//         booking.subCategories.orderEndTime,
//         targetTimezone
//       );
//       if (localEnd) {
//         converted.displayEndDate = localEnd.localDate;
//         converted.displayEndTime = localEnd.localTime;
//         converted.displayEndDateTime = localEnd.localDateTime;
//       }
//     }

//     // Convert cancel time
//     if (booking.cancelDate && booking.cancelTime) {
//       const localCancel = convertFromUTC(
//         booking.cancelDate,
//         booking.cancelTime,
//         targetTimezone
//       );
//       if (localCancel) {
//         converted.displayCancelDate = localCancel.localDate;
//         converted.displayCancelTime = localCancel.localTime;
//         converted.displayCancelDateTime = localCancel.localDateTime;
//       }
//     }

//     // Convert completion time
//     if (booking.FinishedDate && booking.FinishedTime) {
//       const localComplete = convertFromUTC(
//         booking.FinishedDate,
//         booking.FinishedTime,
//         targetTimezone
//       );
//       if (localComplete) {
//         converted.displayCompletionDate = localComplete.localDate;
//         converted.displayCompletionTime = localComplete.localTime;
//         converted.displayCompletionDateTime = localComplete.localDateTime;
//       }
//     }

//     // Convert reschedule request time
//     if (booking.orderRescheduleStartDate && booking.orderRescheduleStartTime) {
//       const localReschedule = convertFromUTC(
//         booking.orderRescheduleStartDate,
//         booking.orderRescheduleStartTime,
//         targetTimezone
//       );
//       if (localReschedule) {
//         converted.displayRescheduleDate = localReschedule.localDate;
//         converted.displayRescheduleTime = localReschedule.localTime;
//         converted.displayRescheduleDateTime = localReschedule.localDateTime;
//       }
//     }

//     // Add timezone info
//     converted.displayTimezone = targetTimezone;
//     converted.storedInUTC = true;

//   } catch (error) {
//     console.error("Error converting booking times:", error);
//   }

//   return converted;
// };

// const getUserBookings = async (req, res) => {
//   try {
//     await schemaForId.validateAsync(req.params);
//     await schema.validateAsync(req.query);

//     const { id } = req.params;
//     const { status, timezone } = req.query;

//     console.log("📋 Get User Bookings:", { userId: id, status, timezone });

//     // Determine which statuses to fetch
//     let statusFilter;
//     if (status === "onGoing") {
//       statusFilter = {
//         $in: ["Accepted", "Pending", "Requested", "OnGoing", "Delivered", "Confirmed"],
//       };
//     } else {
//       statusFilter = {
//         $in: ["Cancelled", "Rejected", "Completed"],
//       };
//     }

//     // Fetch bookings with aggregation
//     const bookService = await getAggregate("userBookServ", [
//       // Step 1: Match documents based on userId and status
//       {
//         $match: {
//           userId: new mongoose.Types.ObjectId(id),
//           status: statusFilter,
//         },
//       },

//       // Lookup subcategory details
//       {
//         $lookup: {
//           from: "subcategories",
//           let: { subCategoryId: { $toObjectId: "$subCategories.id" } },
//           pipeline: [
//             {
//               $match: {
//                 $expr: { $eq: ["$_id", "$$subCategoryId"] },
//               },
//             },
//             {
//               $project: {
//                 categoryName: 1,
//                 name: 1,
//                 _id: 0,
//               },
//             },
//           ],
//           as: "procategories",
//         },
//       },

//       // Lookup professional details
//       {
//         $lookup: {
//           from: "users",
//           let: { professionalId: { $toObjectId: "$professionalId" } },
//           pipeline: [
//             {
//               $match: {
//                 $expr: { $eq: ["$_id", "$$professionalId"] },
//               },
//             },
//             {
//               $project: {
//                 first_Name: 1,
//                 last_Name: 1,
//                 avgReviewsPro: 1,
//                 totalReviewsPro: 1,
//                 businessname: 1,
//                 businessaddress: 1,
//                 businessphoneNo: 1,
//                 longitude: 1,
//                 latitude: 1,
//                 _id: 1,
//               },
//             },
//           ],
//           as: "proDetails",
//         },
//       },

//       // Lookup professional FCM token
//       {
//         $lookup: {
//           from: "tokens",
//           let: { professionalId: { $toObjectId: "$professionalId" } },
//           pipeline: [
//             {
//               $match: {
//                 $expr: { $eq: ["$user_id", "$$professionalId"] },
//               },
//             },
//             {
//               $project: {
//                 user_id: 1,
//                 fcmToken: 1,
//               },
//             },
//           ],
//           as: "proFcmToken",
//         },
//       },

//       // Lookup user FCM token
//       {
//         $lookup: {
//           from: "tokens",
//           let: { userId: { $toObjectId: "$userId" } },
//           pipeline: [
//             {
//               $match: {
//                 $expr: { $eq: ["$user_id", "$$userId"] },
//               },
//             },
//             {
//               $project: {
//                 user_id: 1,
//                 fcmToken: 1,
//               },
//             },
//           ],
//           as: "userFcmToken",
//         },
//       },

//       // Lookup booking amount
//       {
//         $lookup: {
//           from: "probookingservices",
//           let: { bookingId: "$_id" },
//           pipeline: [
//             {
//               $match: {
//                 $expr: { $eq: ["$bookServiceId", "$$bookingId"] },
//               },
//             },
//             {
//               $project: {
//                 _id: 1,
//                 service_fee: 1,
//                 tax_fee: 1,
//                 total_amount: 1,
//                 total_amount_cus_pay: 1,
//               },
//             },
//           ],
//           as: "bookingAmount",
//         },
//       },

//       // Lookup user address
//       {
//         $lookup: {
//           from: "addresses",
//           let: { addressId: { $toObjectId: "$addressId" } },
//           pipeline: [
//             {
//               $match: {
//                 $expr: { $eq: ["$_id", "$$addressId"] },
//               },
//             },
//             {
//               $project: {
//                 longitude: 1,
//                 latitude: 1,
//                 _id: 0,
//               },
//             },
//           ],
//           as: "userAddress",
//         },
//       },

//       // Lookup reviews
//       {
//         $lookup: {
//           from: "reviews",
//           let: { bookingId: "$_id" },
//           pipeline: [
//             {
//               $match: {
//                 $expr: { $eq: ["$bookServiceId", "$$bookingId"] },
//               },
//             },
//             {
//               $project: {
//                 _id: 1,
//                 userId: 1,
//                 professsionalId: 1,
//                 bookServiceId: 1,
//                 comment: 1,
//                 reviewStar: 1,
//                 status: 1,
//                 role: 1,
//                 created_date: 1,
//                 createdAt: 1,
//                 updatedAt: 1,
//               },
//             },
//           ],
//           as: "userReviews",
//         },
//       },

//       // Sort by creation date (newest first)
//       {
//         $sort: { createdAt: -1 },
//       },
//     ]);

//     if (!bookService || bookService.length === 0) {
//       return res.status(200).json({
//         status: 200,
//         message: "No Booking Found!",
//         bookings: [],
//         timezone: timezone,
//       });
//     }

//     // ✅ Convert all booking times to user's timezone
//     const convertedBookings = bookService.map((booking) =>
//       convertBookingTimes(booking, timezone)
//     );

//     console.log(`✅ Found ${convertedBookings.length} bookings for user`);

//     return res.status(200).json({
//       status: 200,
//       message: "Bookings retrieved successfully",
//       count: convertedBookings.length,
//       timezone: timezone,
//       bookService: convertedBookings,
//     });
//   } catch (e) {
//     console.error("❌ Get User Bookings Error:", e);
//     return res.status(400).json({ status: 400, message: e.message });
//   }
// };

// export default getUserBookings;