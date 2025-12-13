import Joi from "joi";
import { findOne, updateDocument } from "../../../helpers/index.js";
import { convertToUTC, extractDate, extractTime } from "../../../utils/index.js";

const schemaBody = Joi.object().keys({
  userId: Joi.string().hex().length(24).optional().allow(""),
  professsionalId: Joi.string().hex().length(24).optional().allow(""),
  bookServiceId: Joi.string().hex().length(24).required(),
  serviceType: Joi.string().optional().allow(""),
  
  // These fields are optional because they might already be stored in the booking
  orderRescheduleStartTime: Joi.string().optional(),
  orderRescheduleStartDate: Joi.string().optional(),
  orderRescheduleEndDate: Joi.string().optional().allow("", null),
  orderRescheduleEndTime: Joi.string().optional().allow("", null),
  
  // Timezone for acceptance timestamp
  timezone: Joi.string().required(),
  
  // Response note
  responseNote: Joi.string().optional().allow(""),
});

const rescheduleAcceptBooking = async (req, res) => {
  try {
    await schemaBody.validateAsync(req.body);

    const {
      bookServiceId,
      userId,
      professsionalId,
      serviceType,
      orderRescheduleStartTime,
      orderRescheduleStartDate,
      orderRescheduleEndDate,
      orderRescheduleEndTime,
      timezone,
      responseNote,
    } = req.body;

   

    // ========== FIND EXISTING RESCHEDULE REQUEST ==========
    const findUserResheduleService = await findOne("userBookServ", {
      _id: bookServiceId,
      status: "Requested",
      orderRescheduleStatus: "Requested",
    });

    if (!findUserResheduleService) {
      return res.status(400).json({
        status: 400,
        message: "No pending reschedule request found",
      });
    }

    const findProResheduleService = await findOne("proBookingService", {
      bookServiceId,
      status: "Requested",
      orderRescheduleStatus: "Requested",
    });

    if (!findProResheduleService) {
      return res.status(400).json({
        status: 400,
        message: "No pending pro reschedule request found",
      });
    }

    // Determine who requested and who is accepting
    const requestedBy = findUserResheduleService.orderRescheduleRequest; // "user" or "professional"
    const acceptedBy = requestedBy === "user" ? "professional" : "user";

    console.log(`📋 Reschedule requested by: ${requestedBy}, being accepted by: ${acceptedBy}`);

    // ========== CHECK IF ALREADY ACCEPTED ==========
    if (findUserResheduleService.orderRescheduleStatus === "Accepted") {
      return res.status(400).json({
        status: 400,
        message: "Reschedule request has already been accepted",
      });
    }

    // ========== GET RESCHEDULE TIMES ==========
    // Use times from existing request if not provided in body
    let rescheduleStartDate = orderRescheduleStartDate || findProResheduleService.orderRescheduleStartDate;
    let rescheduleStartTime = orderRescheduleStartTime || findProResheduleService.orderRescheduleStartTime;
    let rescheduleEndDate = orderRescheduleEndDate || findProResheduleService.orderRescheduleEndDate;
    let rescheduleEndTime = orderRescheduleEndTime || findProResheduleService.orderRescheduleEndTime;

    if (!rescheduleStartDate || !rescheduleStartTime) {
      return res.status(400).json({
        status: 400,
        message: "Reschedule date/time not found",
      });
    }

    console.log("🕒 Applying Reschedule Times:", {
      newDate: rescheduleStartDate,
      newTime: rescheduleStartTime,
    });

    // ========== UPDATE PRO BOOKING ==========
    const updateProData = {
      status: "Confirmed", // ✅ Back to confirmed with new time
      orderRescheduleStatus: "Accepted",
      orderRescheduleResponseBy: acceptedBy,
      orderRescheduleResponseNote: responseNote || `${acceptedBy} accepted reschedule`,
      orderRescheduleAcceptedAt: new Date().toISOString(),
      
      // Apply the new reschedule times to main booking times
      orderStartDate: rescheduleStartDate, // Already in UTC from request
      orderStartTime: rescheduleStartTime, // Already in UTC from request
      orderEndDate: rescheduleEndDate || null,
      orderEndTime: rescheduleEndTime || null,
    };

    const updateProResheduleService = await updateDocument(
      "proBookingService",
      {
        bookServiceId,
        status: "Requested",
        orderRescheduleStatus: "Requested",
      },
      updateProData
    );

    if (!updateProResheduleService) {
      return res.status(400).json({
        status: 400,
        message: "Failed to update pro booking",
      });
    }

    // ========== UPDATE USER BOOKING ==========
    // Update subCategories with new times
    const updatedSubCategories = {
      ...findUserResheduleService.subCategories,
      orderStartDate: rescheduleStartDate, // Already in UTC from request
      orderStartTime: rescheduleStartTime, // Already in UTC from request
      orderEndDate: rescheduleEndDate || findUserResheduleService.subCategories.orderEndDate,
      orderEndTime: rescheduleEndTime || findUserResheduleService.subCategories.orderEndTime,
    };

    const updateUserData = {
      status: "Confirmed", // ✅ Back to confirmed with new time
      orderRescheduleStatus: "Accepted",
      orderRescheduleResponseBy: acceptedBy,
      orderRescheduleResponseNote: responseNote || `${acceptedBy} accepted reschedule`,
      orderRescheduleAcceptedAt: new Date().toISOString(),
      subCategories: updatedSubCategories,
    };

    const userBookServiceReshedule = await updateDocument(
      "userBookServ",
      {
        _id: bookServiceId,
        status: "Requested",
        orderRescheduleStatus: "Requested",
      },
      updateUserData
    );

    if (!userBookServiceReshedule) {
      return res.status(400).json({
        status: 400,
        message: "Failed to update user booking",
      });
    }

    console.log("✅ Reschedule Accepted Successfully");

    // ========== SEND NOTIFICATION (Optional) ==========
    // You can add notification logic here
    // sendNotification(userId, "Your reschedule request has been accepted");

    return res.status(200).json({
      status: 200,
      message: `${acceptedBy === "professional" ? "Professional" : "User"} has accepted the reschedule request`,
      // data: {
      //   bookingId: bookServiceId,
      //   newDateTime: {
      //     date: rescheduleStartDate,
      //     time: rescheduleStartTime,
      //     endDate: rescheduleEndDate,
      //     endTime: rescheduleEndTime,
      //   },
      //   acceptedBy: acceptedBy,
      //   acceptedAt: new Date().toISOString(),
      // },
    });
  } catch (e) {
    console.error("❌ Accept Reschedule Error:", e);
    return res.status(400).json({ status: 400, message: e.message });
  }
};

export default rescheduleAcceptBooking;