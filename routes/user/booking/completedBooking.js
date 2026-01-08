import Joi from "joi";
import { findOne, updateDocument } from "../../../helpers/index.js";
import { convertToUTC, extractDate, extractTime } from "../../../utils/index.js";
import send_email from "../../../lib/node-mailer/index.js";

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


     // ========== FIND USER ==========
    const findUser = await findOne("user", {
      _id: getProBooking?.userId,
    });


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


// ========== SEND EMAILS ==========

// 1. Email to USER - Service Completed
await send_email(
  "bookingCompletedUser",
  {
    userName: findUser?.first_Name || "User",
    bookingId:  deliveredUserBooking?.requestId,
    serviceName: deliveredUserBooking?.subCategories?.serviceType || "Service",
    proName: findPro?.first_Name || "Professional",
    completedDate: utcComplete.utcDate,
    completedTime: utcComplete.utcTime,
    totalAmount: getProBooking?.total_amount?.toFixed(2) || "0.00"
  },
  process.env.SENDER_EMAIL,
  "Service Completed Successfully ✅",
  findUser?.email // User's email
);

// 2. Email to PROFESSIONAL - Payment Received
await send_email(
  "bookingCompletedPro",
  {
    proName: findPro?.first_Name || "Professional",
   bookingId:  deliveredUserBooking?.requestId,
    userName: findUser?.first_Name || "Client",
    serviceName: deliveredUserBooking?.subCategories?.serviceType || "Service",
    completedDate: utcComplete.utcDate,
    completedTime: utcComplete.utcTime,
    originalServiceFee: parseFloat(getProBooking?.service_fee || 0).toFixed(2),
    deductedCharges: deductedFromCharges.toFixed(2) || '0',
    netPayment: serviceFees.toFixed(2),
    currentBalance: (parseFloat(findPro.currentBalance || 0) + serviceFees).toFixed(2),
    totalEarnings: (parseFloat(findPro.totalEarnings || 0) + parseFloat(getProBooking?.service_fee || 0)).toFixed(2),
    serviceDuration: "N/A" // Calculate if you have start/end time
  },
  process.env.SENDER_EMAIL,
  "Payment Received - Service Completed 💰",
  findPro?.email // Professional's email
);


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