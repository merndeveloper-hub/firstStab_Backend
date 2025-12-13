import Joi from "joi";
import { getAggregate } from "../../../helpers/index.js";
import { convertFromUTC } from "../../../utils/index.js";
import mongoose from "mongoose";

const schemaForId = Joi.object().keys({
  id: Joi.string().hex().length(24).required(),
});

const schema = Joi.object().keys({
  status: Joi.string().optional(),
  timezone: Joi.string().required(), // ✅ Required timezone
});

/**
 * Convert and UPDATE booking times in the document
 */
const convertBookingTimes = (booking, targetTimezone) => {
  const converted = { ...booking };

  try {
    // ✅ Convert and UPDATE order start time (in subCategories)
    if (booking.subCategories?.orderStartDate && booking.subCategories?.orderStartTime) {
      const localStart = convertFromUTC(
        booking.subCategories.orderStartDate,
        booking.subCategories.orderStartTime,
        targetTimezone
      );
      if (localStart) {
        // Update the original fields with local time
        converted.subCategories.orderStartDate = localStart.localDate;
        converted.subCategories.orderStartTime = localStart.localTime;
        
        // Also add display fields
        converted.displayStartDate = localStart.localDate;
        converted.displayStartTime = localStart.localTime;
        converted.displayStartDateTime = localStart.localDateTime;
      }
    }

    // ✅ Convert and UPDATE order end time (in subCategories)
    if (booking.subCategories?.orderEndDate && booking.subCategories?.orderEndTime) {
      const localEnd = convertFromUTC(
        booking.subCategories.orderEndDate,
        booking.subCategories.orderEndTime,
        targetTimezone
      );
      if (localEnd) {
        // Update the original fields with local time
        converted.subCategories.orderEndDate = localEnd.localDate;
        converted.subCategories.orderEndTime = localEnd.localTime;
        
        // Also add display fields
        converted.displayEndDate = localEnd.localDate;
        converted.displayEndTime = localEnd.localTime;
        converted.displayEndDateTime = localEnd.localDateTime;
      }
    }

    // ✅ Convert and UPDATE cancel time
    if (booking.CancelDate && booking.CancelTime) {
      const localCancel = convertFromUTC(
        booking.CancelDate,
        booking.CancelTime,
        targetTimezone
      );
      if (localCancel) {
        // Update the original fields
        converted.CancelDate = localCancel.localDate;
        converted.CancelTime = localCancel.localTime;
        
        // Also add display fields
        converted.displayCancelDate = localCancel.localDate;
        converted.displayCancelTime = localCancel.localTime;
        converted.displayCancelDateTime = localCancel.localDateTime;
      }
    }

    // ✅ Convert and UPDATE completion/finished time
    if (booking.FinishedDate && booking.FinishedTime) {
      const localComplete = convertFromUTC(
        booking.FinishedDate,
        booking.FinishedTime,
        targetTimezone
      );
      if (localComplete) {
        // Update the original fields
        converted.FinishedDate = localComplete.localDate;
        converted.FinishedTime = localComplete.localTime;
        
        // Also add display fields
        converted.displayCompletionDate = localComplete.localDate;
        converted.displayCompletionTime = localComplete.localTime;
        converted.displayCompletionDateTime = localComplete.localDateTime;
      }
    }

    // ✅ Convert and UPDATE reschedule request time
    if (booking.orderRescheduleStartDate && booking.orderRescheduleStartTime) {
      const localReschedule = convertFromUTC(
        booking.orderRescheduleStartDate,
        booking.orderRescheduleStartTime,
        targetTimezone
      );
      if (localReschedule) {
        // Update the original fields
        converted.orderRescheduleStartDate = localReschedule.localDate;
        converted.orderRescheduleStartTime = localReschedule.localTime;
        
        // Also add display fields
        converted.displayRescheduleDate = localReschedule.localDate;
        converted.displayRescheduleTime = localReschedule.localTime;
        converted.displayRescheduleDateTime = localReschedule.localDateTime;
      }
    }

    // ✅ Convert and UPDATE reschedule end time
    if (booking.orderRescheduleEndDate && booking.orderRescheduleEndTime) {
      const localRescheduleEnd = convertFromUTC(
        booking.orderRescheduleEndDate,
        booking.orderRescheduleEndTime,
        targetTimezone
      );
      if (localRescheduleEnd) {
        // Update the original fields
        converted.orderRescheduleEndDate = localRescheduleEnd.localDate;
        converted.orderRescheduleEndTime = localRescheduleEnd.localTime;
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

const getUserBookings = async (req, res) => {
  try {
    await schemaForId.validateAsync(req.params);
    await schema.validateAsync(req.query);

    const { id } = req.params;
    const { status, timezone } = req.query;


    // Determine which statuses to fetch
    let statusFilter;
    if (status === "onGoing") {
      statusFilter = {
        $in: ["Accepted", "Pending", "Requested", "OnGoing", "Delivered", "Confirmed"],
      };
    } else {
      statusFilter = {
        $in: ["Cancelled", "Rejected", "Completed"],
      };
    }

    // Fetch bookings with aggregation
    const getbookService = await getAggregate("userBookServ", [
      // Step 1: Match documents based on userId and status
      {
        $match: {
          userId: new mongoose.Types.ObjectId(id),
          status: statusFilter,
        },
      },

      // Lookup subcategory details
      {
        $lookup: {
          from: "subcategories",
          let: { subCategoryId: { $toObjectId: "$subCategories.id" } },
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

      // Lookup professional details
      {
        $lookup: {
          from: "users",
          let: { professionalId: { $toObjectId: "$professionalId" } },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$_id", "$$professionalId"] },
              },
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
          let: { professionalId: { $toObjectId: "$professionalId" } },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$user_id", "$$professionalId"] },
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

      // Lookup booking amount
      {
        $lookup: {
          from: "probookingservices",
          let: { bookingId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$bookServiceId", "$$bookingId"] },
              },
            },
            {
              $project: {
                _id: 1,
                service_fee: 1,
                tax_fee: 1,
                total_amount: 1,
                total_amount_cus_pay: 1,
              },
            },
          ],
          as: "bookingAmount",
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

      // Lookup reviews
      {
        $lookup: {
          from: "reviews",
          let: { bookingId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$bookServiceId", "$$bookingId"] },
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
          as: "userReviews",
        },
      },

      // Sort by creation date (newest first)
      {
        $sort: { createdAt: -1 },
      },
    ]);

    if (!getbookService || getbookService.length === 0) {
      return res.status(200).json({
        status: 200,
        message: "No Booking Found!",
        bookService: [],
      });
    }

    // ✅ Convert all booking times to user's timezone and UPDATE original fields
    const bookService = getbookService.map((booking) =>
      convertBookingTimes(booking, timezone)
    );


    return res.status(200).json({
      status: 200,
      message: "Bookings retrieved successfully",
      bookService,
    });
  } catch (e) {
    console.error("❌ Get User Bookings Error:", e);
    return res.status(400).json({ status: 400, message: e.message });
  }
};

export default getUserBookings;