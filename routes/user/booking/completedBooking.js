import Joi from "joi";
import { findOne, updateDocument } from "../../../helpers/index.js";
import { convertToUTC, extractDate, extractTime } from "../../../utils/index.js";

const schema = Joi.object().keys({
  id: Joi.string().hex().length(24).required(),
});

const schemaBody = Joi.object({
  isVirtual: Joi.string().optional(), // Not really needed, can get from booking
  FinishedTime: Joi.string().required(), // HH:mm:ss
  FinishedDate: Joi.string().required(), // YYYY-MM-DD
  timezone: Joi.string().required(), // ✅ User's timezone
  completionNotes: Joi.string().optional().allow(""),
  rating: Joi.number().min(1).max(5).optional(),
});

const completedBooking = async (req, res) => {
  try {
    await schema.validateAsync(req.params);
    await schemaBody.validateAsync(req.body);

    const { id } = req.params;
    const { FinishedTime, FinishedDate, timezone, completionNotes, rating } = req.body;

    console.log("✅ Complete Request:", { id, FinishedDate, FinishedTime, timezone });

    // ========== FIND BOOKINGS ==========
    const deliveredUserBooking = await findOne("userBookServ", { _id: id });
    if (!deliveredUserBooking) {
      return res.status(400).json({ status: 400, message: "No Booking Found!" });
    }

    // Check if already completed
    if (deliveredUserBooking.status === "Completed") {
      return res.status(400).json({
        status: 400,
        message: "Booking is already completed",
      });
    }

    // Check if cancelled
    if (deliveredUserBooking.status === "Cancelled") {
      return res.status(400).json({
        status: 400,
        message: "Cannot complete a cancelled booking",
      });
    }

    const getProBooking = await findOne("proBookingService", {
      bookServiceId: id,
    });
    if (!getProBooking) {
      return res.status(400).json({ status: 400, message: "No Pro Booking Found!" });
    }

    // ========== VALIDATE AND CONVERT COMPLETION TIME TO UTC ==========
    const validatedFinishDate = extractDate(FinishedDate);
    const validatedFinishTime = extractTime(FinishedTime);

    if (!validatedFinishDate || !validatedFinishTime) {
      return res.status(400).json({
        status: 400,
        message: "Invalid finish date or time format",
      });
    }

    // Convert user's completion time to UTC
    const utcComplete = convertToUTC(validatedFinishDate, validatedFinishTime, timezone);
    if (!utcComplete) {
      return res.status(400).json({
        status: 400,
        message: "Failed to convert completion time to UTC",
      });
    }

    console.log("🕒 Completion Time Conversion:", {
      userTimezone: timezone,
      userDateTime: `${validatedFinishDate} ${validatedFinishTime}`,
      utcDateTime: `${utcComplete.utcDate} ${utcComplete.utcTime}`,
    });

    // ========== FIND PROFESSIONAL ==========
    const findPro = await findOne("user", {
      _id: getProBooking?.professsionalId,
    });

    if (!findPro) {
      return res.status(400).json({
        status: 400,
        message: "Professional not found",
      });
    }

    // ========== CALCULATE PAYMENT ==========
    let serviceFees = parseFloat(getProBooking?.service_fee || 0);
    const pendingCharges = parseFloat(findPro.totalCharges || 0);
    let deductedFromCharges = 0;

    // Deduct pending charges first
    if (pendingCharges > 0) {
      if (serviceFees >= pendingCharges) {
        // Pro can fully pay pending charges
        deductedFromCharges = pendingCharges;
        serviceFees = serviceFees - pendingCharges;
      } else {
        // Partial payment only
        deductedFromCharges = serviceFees;
        serviceFees = 0;
      }
    }

    console.log("💰 Payment Calculation:", {
      originalServiceFee: getProBooking?.service_fee,
      pendingCharges,
      deductedFromCharges,
      finalPayment: serviceFees,
    });

    // ========== UPDATE USER BOOKING ==========
    const deliveredBooking = await updateDocument(
      "userBookServ",
      { _id: id },
      {
        status: "Completed",
        FinishedTime: utcComplete.utcTime, // ✅ Store in UTC
        FinishedDate: utcComplete.utcDate, // ✅ Store in UTC
        completionTimezone: timezone, // ✅ Store user's timezone
        completionNotes: completionNotes || "Service completed",
        rating: rating || null,
        completedAt: new Date().toISOString(),
      }
    );

    if (!deliveredBooking) {
      return res.status(400).json({ status: 400, message: "Failed to update booking!" });
    }

    // ========== UPDATE PRO BOOKING ==========
    await updateDocument(
      "proBookingService",
      { bookServiceId: id },
      {
        status: "Completed",
        FinishedTime: utcComplete.utcTime, // ✅ Store in UTC
        FinishedDate: utcComplete.utcDate, // ✅ Store in UTC
        completionTimezone: timezone, // ✅ Store user's timezone
        completionNotes: completionNotes || "Service completed",
        rating: rating || null,
        completedAt: new Date().toISOString(),
      }
    );

    // ========== UPDATE PROFESSIONAL BALANCE ==========
    await updateDocument(
      "user",
      { _id: getProBooking?.professsionalId },
      {
        $inc: {
          totalCharges: -deductedFromCharges, // Reduce penalties
          currentBalance: serviceFees, // Add remaining balance
          netEarnings: serviceFees, // Net earning after charges
          totalEarnings: parseFloat(getProBooking?.service_fee || 0), // Total without deductions
        },
      }
    );

    console.log("✅ Booking Completed Successfully");

    return res.status(200).json({
      status: 200,
      message: "Booking completed successfully!",
      // booking: deliveredBooking,
      // payment: {
      //   serviceFee: parseFloat(getProBooking?.service_fee || 0),
      //   deductedCharges: deductedFromCharges,
      //   paidToPro: serviceFees,
      // },
    });
  } catch (err) {
    console.error("❌ Complete Booking Error:", err);
    return res.status(500).json({ status: 500, message: err.message });
  }
};

export default completedBooking;