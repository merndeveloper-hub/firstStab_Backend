import Joi from "joi";
import { findOne, updateDocument, find } from "../../../helpers/index.js";
import { convertToUTC, extractDate, extractTime } from "../../../utils/index.js";
import moment from "moment-timezone";

const schemaBody = Joi.object().keys({
  userId: Joi.string().hex().length(24).optional().allow(""),
  professsionalId: Joi.string().hex().length(24).optional().allow(""),
  bookServiceId: Joi.string().hex().length(24).required(),
  serviceType: Joi.string().optional().allow(""),
  
  // ✅ Reschedule date/time fields
  orderRescheduleStartTime: Joi.string().required(), // HH:mm:ss
  orderRescheduleStartDate: Joi.string().required(), // YYYY-MM-DD
  orderRescheduleEndDate: Joi.string().optional().allow("", null),
  orderRescheduleEndTime: Joi.string().optional().allow("", null),
  
  // ✅ Timezone field (required)
  timezone: Joi.string().required(),
  
  // Other fields
  orderRescheduleReason: Joi.string().optional().allow(""),
});

const proRescheduleRequest = async (req, res) => {
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
      orderRescheduleReason,
      timezone,
    } = req.body;

    console.log("🔄 Pro Reschedule Request:", {
      bookServiceId,
      orderRescheduleStartDate,
      orderRescheduleStartTime,
      timezone,
    });

    // ========== FIND BOOKINGS ==========
    const userBooking = await findOne("userBookServ", {
      _id: bookServiceId,
    });

    if (!userBooking) {
      return res.status(400).json({
        status: 400,
        message: "Booking Not Found",
      });
    }

    const proBooking = await findOne("proBookingService", {
      bookServiceId,
    });

    if (!proBooking) {
      return res.status(400).json({
        status: 400,
        message: "Pro Booking Not Found",
      });
    }

    // ========== CHECK IF ALREADY RESCHEDULED ==========
    if (userBooking.orderRescheduleNumber === "1") {
      return res.status(400).json({
        status: 400,
        message: "Booking has already been rescheduled once",
      });
    }

    // ========== CHECK IF COMPLETED ==========
    if (userBooking.status === "Completed" || proBooking.status === "Completed") {
      return res.status(400).json({
        status: 400,
        message: "Cannot reschedule a completed booking",
      });
    }

    // ========== CHECK IF CANCELLED ==========
    if (userBooking.status === "Cancelled" || proBooking.status === "Cancelled") {
      return res.status(400).json({
        status: 400,
        message: "Cannot reschedule a cancelled booking",
      });
    }

    // ========== CHECK IF USER ALREADY REQUESTED ==========
    if (
      userBooking.orderRescheduleStatus === "Requested" &&
      userBooking.orderRescheduleRequest === "user"
    ) {
      return res.status(400).json({
        status: 400,
        message: "User has already requested reschedule. Please respond to their request first.",
      });
    }

    // ========== CHECK IF PROFESSIONAL ALREADY REQUESTED ==========
    if (
      userBooking.orderRescheduleStatus === "Requested" &&
      userBooking.orderRescheduleRequest === "professional"
    ) {
      return res.status(400).json({
        status: 400,
        message: "You have already requested reschedule. Please wait for user's response.",
      });
    }

    // ========== VALIDATE BOOKING STATUS ==========
    if (userBooking.status !== "Confirmed" || proBooking.status !== "Confirmed") {
      return res.status(400).json({
        status: 400,
        message: "Only confirmed bookings can be rescheduled",
      });
    }

    // ========== VALIDATE AND CONVERT RESCHEDULE TIME TO UTC ==========
    const validatedStartDate = extractDate(orderRescheduleStartDate);
    const validatedStartTime = extractTime(orderRescheduleStartTime);

    if (!validatedStartDate || !validatedStartTime) {
      return res.status(400).json({
        status: 400,
        message: "Invalid reschedule date or time format",
      });
    }

    // Convert professional's reschedule time to UTC
    const utcRescheduleStart = convertToUTC(validatedStartDate, validatedStartTime, timezone);
    if (!utcRescheduleStart) {
      return res.status(400).json({
        status: 400,
        message: "Failed to convert reschedule time to UTC",
      });
    }

    // Handle end date/time if provided
    let utcRescheduleEnd = null;
    if (orderRescheduleEndDate && orderRescheduleEndTime) {
      const validatedEndDate = extractDate(orderRescheduleEndDate);
      const validatedEndTime = extractTime(orderRescheduleEndTime);

      if (validatedEndDate && validatedEndTime) {
        utcRescheduleEnd = convertToUTC(validatedEndDate, validatedEndTime, timezone);
      }
    }

    console.log("🕒 Reschedule Time Conversion:", {
      proTimezone: timezone,
      proDateTime: `${validatedStartDate} ${validatedStartTime}`,
      utcDateTime: `${utcRescheduleStart.utcDate} ${utcRescheduleStart.utcTime}`,
    });

    // ========== CHECK IF RESCHEDULE TIME IS IN THE PAST ==========
    const rescheduleDateTime = moment.utc(
      `${utcRescheduleStart.utcDate}T${utcRescheduleStart.utcTime}`,
      "YYYY-MM-DDTHH:mm:ss"
    );
    const currentDateTime = moment.utc();

    if (rescheduleDateTime.isBefore(currentDateTime)) {
      return res.status(400).json({
        status: 400,
        message: "Cannot reschedule to a past date/time",
      });
    }

    // ========== CHECK IF PROFESSIONAL HAS CONFLICT ==========
    if (proBooking.professsionalId) {
      const timeHHMM = utcRescheduleStart.utcTime.slice(0, 5);
      
      const existingBookings = await find("proBookingService", {
        professsionalId: proBooking.professsionalId,
        orderStartDate: utcRescheduleStart.utcDate,
        serviceType: { $in: ["isChat", "isVirtual", "isInPerson"] },
        status: { $in: ["Pending", "Accepted", "Confirmed"] },
        _id: { $ne: proBooking._id }, // Exclude current booking
        orderStartTime: { $regex: `^${timeHHMM}` },
      });

      if (existingBookings.length > 0) {
        return res.status(400).json({
          status: 400,
          message: "You already have a booking at the requested time. Please choose a different time.",
        });
      }
    }

    // ========== CHECK RESCHEDULE WINDOW (Optional: Must be at least 24 hours before original time) ==========
    const originalDateTime = moment.utc(
      `${userBooking.subCategories.orderStartDate}T${userBooking.subCategories.orderStartTime}`,
      "YYYY-MM-DDTHH:mm:ss"
    );
    
    const hoursUntilOriginal = originalDateTime.diff(currentDateTime, "hours", true);

    if (hoursUntilOriginal < 24) {
      return res.status(400).json({
        status: 400,
        message: "Cannot reschedule within 24 hours of the original booking time",
      });
    }

    // ========== UPDATE BOOKINGS ==========
    const rescheduleData = {
      status: "Requested",
      orderRescheduleStatus: "Requested",
      orderRescheduleRequest: "professional", // ✅ Professional is requesting
      orderRescheduleNumber: "1",
      
      // Store reschedule times in UTC
      orderRescheduleStartDate: utcRescheduleStart.utcDate,
      orderRescheduleStartTime: utcRescheduleStart.utcTime,
      orderRescheduleEndDate: utcRescheduleEnd ? utcRescheduleEnd.utcDate : null,
      orderRescheduleEndTime: utcRescheduleEnd ? utcRescheduleEnd.utcTime : null,
      
      // Store timezone for reference
      rescheduleTimezone: timezone,
      orderRescheduleReason: orderRescheduleReason || "Professional requested reschedule",
      rescheduleRequestedAt: new Date().toISOString(),
    };

    // Update pro booking
    const getProBookService = await updateDocument(
      "proBookingService",
      { bookServiceId, status: "Confirmed" },
      rescheduleData
    );

    if (!getProBookService) {
      return res.status(400).json({
        status: 400,
        message: "Failed to update pro booking",
      });
    }

    // Update user booking
    const userBookServiceUpdate = await updateDocument(
      "userBookServ",
      { _id: bookServiceId, status: "Confirmed" },
      rescheduleData
    );

    if (!userBookServiceUpdate) {
      return res.status(400).json({
        status: 400,
        message: "Failed to update user booking",
      });
    }

    console.log("✅ Pro Reschedule Request Created Successfully");

    return res.status(200).json({
      status: 200,
      message: "Reschedule request sent successfully. Waiting for user's approval.",
      data: {
        getProBookService, userBookServiceUpdate 
        // bookingId: bookServiceId,
        // rescheduleStatus: "Requested",
        // requestedBy: "professional",
        // originalDateTime: {
        //   date: userBooking.subCategories.orderStartDate,
        //   time: userBooking.subCategories.orderStartTime,
        // },
        // newDateTime: {
        //   date: utcRescheduleStart.utcDate,
        //   time: utcRescheduleStart.utcTime,
        //   timezone: timezone,
        // },
      },
    });
  } catch (e) {
    console.error("❌ Pro Reschedule Request Error:", e);
    return res.status(400).json({ status: 400, message: e.message });
  }
};

export default proRescheduleRequest;