import Joi from "joi";
import moment from "moment-timezone";
import { findOne, updateDocument } from "../../../helpers/index.js";
import { convertToUTC, extractDate, extractTime } from "../../../utils/index.js";
import send_email from "../../../lib/node-mailer/index.js";

const schema = Joi.object().keys({
  id: Joi.string().hex().length(24).required(),
});

const schemaBody = Joi.object().keys({
  CancelDate: Joi.string().required(), // YYYY-MM-DD
  CancelTime: Joi.string().required(), // HH:mm:ss
  timezone: Joi.string().required(), // ✅ Professional's timezone
  reasonDescription: Joi.string().optional().allow(""),
  reasonCancel: Joi.string().required(),
});

const proCancelledBooking = async (req, res) => {
  try {
    await schema.validateAsync(req.params);
    await schemaBody.validateAsync(req.body);

    const { id } = req.params;
    const { CancelDate, CancelTime, timezone, reasonDescription, reasonCancel } = req.body;

    console.log("🚫 Pro Cancel Request:", { id, CancelDate, CancelTime, timezone, reasonCancel });

    // ========== FIND BOOKING ==========
    const goingbooking = await findOne("proBookingService", { _id: id });

    if (!goingbooking) {
      return res.status(400).json({ status: 400, message: "No Booking Found!" });
    }

    // Check if already cancelled
    if (goingbooking.status === "Cancelled") {
      return res.status(400).json({
        status: 400,
        message: "Booking is already cancelled",
      });
    }

    // Check if completed
    if (goingbooking.status === "Completed") {
      return res.status(400).json({
        status: 400,
        message: "Cannot cancel a completed booking",
      });
    }

    //find user 
    let findUser = await findOne("user", { _id: goingbooking?.userId })


    //find pro 
    let findPro = await findOne("user", { _id: goingbooking?.professsionalId })

    // ========== VALIDATE AND CONVERT CANCEL TIME TO UTC ==========
    const validatedCancelDate = extractDate(CancelDate);
    const validatedCancelTime = extractTime(CancelTime);

    if (!validatedCancelDate || !validatedCancelTime) {
      return res.status(400).json({
        status: 400,
        message: "Invalid cancel date or time format",
      });
    }

    // Convert pro's cancel time to UTC
    const utcCancel = convertToUTC(validatedCancelDate, validatedCancelTime, timezone);
    if (!utcCancel) {
      return res.status(400).json({
        status: 400,
        message: "Failed to convert cancel time to UTC",
      });
    }

    console.log("🕒 Cancel Time Conversion:", {
      proTimezone: timezone,
      proDateTime: `${validatedCancelDate} ${validatedCancelTime}`,
      utcDateTime: `${utcCancel.utcDate} ${utcCancel.utcTime}`,
    });

    // ========== RETRIEVE STORED BOOKING TIME (IN UTC) ==========
    const storedOrderDate = goingbooking.orderStartDate; // UTC
    const storedOrderTime = goingbooking.orderStartTime; // UTC

    if (!storedOrderDate || !storedOrderTime) {
      return res.status(400).json({
        status: 400,
        message: "Booking order time not found",
      });
    }

    // ========== CALCULATE TIME DIFFERENCE (IN UTC) ==========
    const startTimeUTC = moment.utc(`${storedOrderDate}T${storedOrderTime}`, "YYYY-MM-DDTHH:mm:ss");
    const cancelTimeUTC = moment.utc(`${utcCancel.utcDate}T${utcCancel.utcTime}`, "YYYY-MM-DDTHH:mm:ss");

    const diffInHours = startTimeUTC.diff(cancelTimeUTC, "hours", true);

    console.log("⏱️ Time Difference:", {
      startTimeUTC: startTimeUTC.format(),
      cancelTimeUTC: cancelTimeUTC.format(),
      diffInHours: diffInHours,
    });

    // ========== FETCH PAYMENT INFO ==========
    const findPaymentMethod = await findOne("userPayment", {
      bookServiceId: id,
    });

    const adminCharges = await findOne("adminFees");

    let findPaymentCharges = 0;
    if (findPaymentMethod && adminCharges) {
      findPaymentCharges =
        findPaymentMethod?.paymentMethod === "Paypal"
          ? Number(adminCharges.paypalFixedFee || 0) + Number(adminCharges.paypalFeePercentage || 0)
          : Number(adminCharges.stripeFeePercentage || 0) + Number(adminCharges.stripeFixedFee || 0);
    }

    // ========== CANCELLATION LOGIC ==========

    // 1️⃣ User-related issues (Manual decision)
    const userIssues = ["User No Show", "User Cancelled", "User Did Not Respond"];

    if (userIssues.includes(reasonCancel)) {
      console.log("📌 User Issue - Manual Review Required");

      const cancelbooking = await updateDocument(
        "proBookingService",
        { _id: id },
        {
          status: "Cancelled",
          cancelledReason: "Cancelled By Professional - User Issue",
          CancelDate: utcCancel.utcDate,
          CancelTime: utcCancel.utcTime,
          cancelTimezone: timezone,
          reasonDescription,
          reasonCancel,
          amountReturn: "Manually decide",
          cancelledAt: new Date().toISOString(),
        }
      );

      await updateDocument(
        "userBookServ",
        {
          _id: cancelbooking?.bookServiceId,
          status: { $in: ["Accepted", "Pending", "Confirmed"] },
        },
        {
          status: "Cancelled",
          cancelledReason: "Cancelled By Professional - User Issue",
          CancelDate: utcCancel.utcDate,
          CancelTime: utcCancel.utcTime,
          cancelTimezone: timezone,
          reasonDescription,
          reasonCancel,
          amountReturn: "Manually decide",
          cancelledAt: new Date().toISOString(),
        }
      );

      // ========== 1️⃣ USER-ISSUE CANCELLATION (Manual Review) ==========
      // Line 138-164 ke baad add karein

      await send_email(
        "user-issue-cancellation",
        {
          userName: findUser?.first_Name,
          bookingId: id,
          serviceRequestId: goingbooking?.requestId,
          reasonCancel: reasonCancel,
          reasonDescription: reasonDescription || "Not provided"
        },
        process.env.SENDER_EMAIL,
        "Booking Cancellation - Under Review",
        findUser?.email
      );

      await send_email(
        "pro-cancellation-confirmed",
        {
          professionalName: findPro?.first_Name,
          bookingId: id,
          serviceRequestId: goingbooking?.requestId,
          cancelDate: utcCancel.utcDate,
          cancelTime: utcCancel.utcTime
        },
        process.env.SENDER_EMAIL,
        "Booking Cancelled - Manual Review",
        findPro?.email
      );

      return res.status(200).json({
        status: 200,
        message: "Cancelled Booking - Manual Review Required",
        cancelbooking,
      });
    }

    // 2️⃣ Cancel less than 3 hours before (Pro pays penalty)
    if (diffInHours < 3 && diffInHours >= 0) {
      console.log("❌ Pro Cancel <3hrs - Penalty applies");

      const baseServiceFee =
        Number(goingbooking?.service_fee || 0) +
        Number(goingbooking?.platformFees || 0) +
        Number(findPaymentCharges || 0);

      let cancelCharges = 0;

      // Calculate penalty based on service type
      switch (goingbooking.serviceType) {
        case "isInPerson":
          // 50% penalty, max $100
          cancelCharges = Math.min(baseServiceFee * 0.5, 100);
          break;

        case "isVirtual":
          // 50% penalty
          cancelCharges = baseServiceFee * 0.5;
          break;

        case "isChat":
          // $10 + payment charges
          cancelCharges = 10 + Number(findPaymentCharges || 0);
          break;

        case "isRemote":
          // 20% of service fee + payment charges
          cancelCharges = Number(goingbooking?.service_fee || 0) * 0.2 + Number(findPaymentCharges || 0);
          break;

        default:
          cancelCharges = baseServiceFee * 0.5;
      }

      console.log("💰 Penalty Calculation:", {
        serviceType: goingbooking.serviceType,
        baseServiceFee,
        cancelCharges,
      });

      // Update pro booking
      const cancelbooking = await updateDocument(
        "proBookingService",
        { _id: id },
        {
          CancelCharges: cancelCharges,
          status: "Cancelled",
          cancelledReason: "Cancelled By Professional",
          CancelDate: utcCancel.utcDate,
          CancelTime: utcCancel.utcTime,
          cancelTimezone: timezone,
          priceToReturn: baseServiceFee,
          reasonDescription,
          reasonCancel,
          CancellationChargesApplyTo: "pro",
          amountReturn: "user",
          ProfessionalPayableAmount: cancelCharges,
          cancelledAt: new Date().toISOString(),
        }
      );

      // Update user booking
      await updateDocument(
        "userBookServ",
        {
          _id: cancelbooking?.bookServiceId,
          status: { $in: ["Accepted", "Pending", "Confirmed"] },
        },
        {
          status: "Cancelled",
          cancelledReason: "Cancelled By Professional",
          CancelDate: utcCancel.utcDate,
          CancelTime: utcCancel.utcTime,
          cancelTimezone: timezone,
          CancelCharges: cancelCharges,
          priceToReturn: baseServiceFee,
          reasonDescription,
          reasonCancel,
          CancellationChargesApplyTo: "pro",
          amountReturn: "user",
          ProfessionalPayableAmount: cancelCharges,
          cancelledAt: new Date().toISOString(),
        }
      );

      // Add penalty to pro's charges
      await updateDocument(
        "user",
        { _id: goingbooking.professsionalId },
        {
          $inc: { totalCharges: cancelCharges },
        }
      );

      // Refund user
      await updateDocument(
        "user",
        { _id: goingbooking.userId },
        {
          $inc: { currentBalance: baseServiceFee },
        }
      );

      // ========== 2️⃣ PRO CANCEL <3 HOURS (Penalty Applied) ==========
      // Line 251-275 ke baad add karein

      await send_email(
        "user-refund-notification",
        {
          userName: findUser?.first_Name,
          bookingId: id,
          serviceRequestId: goingbooking?.requestId,
          refundAmount: baseServiceFee.toFixed(2),
          cancelDate: utcCancel.utcDate,
          cancelTime: utcCancel.utcTime
        },
        process.env.SENDER_EMAIL,
        "Booking Cancelled - Full Refund Issued",
        findUser?.email
      );

      await send_email(
        "pro-penalty-notification",
        {
          professionalName: findPro?.first_Name,
          bookingId: id,
          serviceRequestId: goingbooking?.requestId,
          penaltyAmount: cancelCharges.toFixed(2),
          cancelDate: utcCancel.utcDate,
          cancelTime: utcCancel.utcTime
        },
        process.env.SENDER_EMAIL,
        "Booking Cancelled - Penalty Applied",
        findPro?.email
      );

      return res.status(200).json({
        status: 200,
        message: "Booking cancelled - Penalty applied to professional",
        cancelbooking,
        // penalty: cancelCharges,
        // refundedToUser: baseServiceFee,
      });
    }

    // 3️⃣ Cancel 3+ hours before (No penalty - but still notify)
    if (diffInHours >= 3) {
      console.log("✅ Pro Cancel >=3hrs - No penalty");

      const baseServiceFee =
        Number(goingbooking?.service_fee || 0) +
        Number(goingbooking?.platformFees || 0);

      const cancelCharges =

        Number(findPaymentCharges || 0);

      const cancelbooking = await updateDocument(
        "proBookingService",
        { _id: id },
        {
          CancelCharges: cancelCharges,
          status: "Cancelled",
          cancelledReason: "Cancelled By Professional",
          CancelDate: utcCancel.utcDate,
          CancelTime: utcCancel.utcTime,
          cancelTimezone: timezone,
          priceToReturn: baseServiceFee,
          reasonDescription,
          reasonCancel,
          CancellationChargesApplyTo: "none",
          amountReturn: "user",
          ProfessionalPayableAmount: cancelCharges,
          cancelledAt: new Date().toISOString(),
        }
      );

      await updateDocument(
        "userBookServ",
        {
          _id: cancelbooking?.bookServiceId,
          status: { $in: ["Accepted", "Pending", "Confirmed"] },
        },
        {
          status: "Cancelled",
          cancelledReason: "Cancelled By Professional",
          CancelDate: utcCancel.utcDate,
          CancelTime: utcCancel.utcTime,
          cancelTimezone: timezone,
          CancelCharges: cancelCharges,
          priceToReturn: baseServiceFee,
          reasonDescription,
          reasonCancel,
          CancellationChargesApplyTo: "none",
          amountReturn: "user",
          ProfessionalPayableAmount: cancelCharges,
          cancelledAt: new Date().toISOString(),
        }
      );

      // Refund user
      await updateDocument(
        "user",
        { _id: goingbooking.userId },
        {
          $inc: { currentBalance: baseServiceFee },
        }
      );

      // Add penalty to pro's charges
      await updateDocument(
        "user",
        { _id: goingbooking.professsionalId },
        {
          $inc: { totalCharges: cancelCharges },
        }
      );
      // ========== 3️⃣ PRO CANCEL ≥3 HOURS (No Penalty) ==========
      // Line 340-361 ke baad add karein

      await send_email(
        "user-refund-notification",
        {
          userName: findUser?.first_Name,
          bookingId: id,
          serviceRequestId: goingbooking?.requestId,
          refundAmount: baseServiceFee.toFixed(2),
          cancelDate: utcCancel.utcDate,
          cancelTime: utcCancel.utcTime
        },
        process.env.SENDER_EMAIL,
        "Booking Cancelled - Full Refund Issued",
        findUser?.email
      );

      await send_email(
        "pro-cancellation-confirmed",
        {
          professionalName: findPro?.first_Name,
          bookingId: id,
          serviceRequestId: goingbooking?.requestId,
          cancelDate: utcCancel.utcDate,
          cancelTime: utcCancel.utcTime
        },
        process.env.SENDER_EMAIL,
        "Booking Cancellation Confirmed - No Penalty",
        findPro?.email
      );


      return res.status(200).json({
        status: 200,
        message: "Booking cancelled - No penalty (3+ hours notice)",
        cancelbooking,
        //   refundedToUser: baseServiceFee,
      });
    }

    // 4️⃣ Default case (after booking time has passed)
    console.log("📌 Default - Cancellation after booking time");

    const cancelbooking = await updateDocument(
      "proBookingService",
      { _id: id },
      {
        status: "Cancelled",
        cancelledReason: "Cancelled By Professional",
        CancelDate: utcCancel.utcDate,
        CancelTime: utcCancel.utcTime,
        cancelTimezone: timezone,
        reasonDescription,
        reasonCancel,
        cancelledAt: new Date().toISOString(),
      }
    );

    await updateDocument(
      "userBookServ",
      {
        _id: cancelbooking?.bookServiceId,
        status: { $in: ["Accepted", "Pending", "Confirmed"] },
      },
      {
        status: "Cancelled",
        cancelledReason: "Cancelled By Professional",
        CancelDate: utcCancel.utcDate,
        CancelTime: utcCancel.utcTime,
        cancelTimezone: timezone,
        reasonDescription,
        reasonCancel,
        cancelledAt: new Date().toISOString(),
      }
    );

    return res.status(200).json({
      status: 200,
      message: "Cancelled Booking By Professional",
      cancelbooking,
    });
  } catch (e) {
    console.error("❌ Pro Cancel Booking Error:", e);
    return res.status(400).json({ status: 400, message: e.message });
  }
};

export default proCancelledBooking;