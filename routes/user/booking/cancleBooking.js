import Joi from "joi";
import { findOne, updateDocument } from "../../../helpers/index.js";
import { convertToUTC, extractDate, extractTime } from "../../../utils/index.js";
import moment from "moment-timezone";
import send_email from "../../../lib/node-mailer/index.js";

const schema = Joi.object().keys({
  id: Joi.string().hex().length(24).required(),
});

const schemaBody = Joi.object().keys({
  CancelDate: Joi.string().required(), // YYYY-MM-DD
  CancelTime: Joi.string().required(), // HH:mm:ss
  timezone: Joi.string().required(), // User's timezone
  reasonDescription: Joi.string().optional().allow(""),
  reasonCancel: Joi.string().required(),
});

const cancelledBooking = async (req, res) => {
  try {
    await schema.validateAsync(req.params);
    await schemaBody.validateAsync(req.body);

    const { id } = req.params;
    const { CancelDate, CancelTime, timezone, reasonDescription, reasonCancel } = req.body;

    console.log("🚫 Cancel Request:", { id, CancelDate, CancelTime, timezone, reasonCancel });

    // ========== FIND BOOKING ==========
    const goingbooking = await findOne("userBookServ", { _id: id });

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

    // =======Find User
    const findUser = await findOne("user", { _id: goingbooking?.userId });


    // ============= Find Pro ==============
    const findPro = await findOne("user", { _id: goingbooking?.professionalId });

    // ========== VALIDATE AND CONVERT CANCEL TIME TO UTC ==========
    const validatedCancelDate = extractDate(CancelDate);
    const validatedCancelTime = extractTime(CancelTime);

    if (!validatedCancelDate || !validatedCancelTime) {
      return res.status(400).json({
        status: 400,
        message: "Invalid cancel date or time format",
      });
    }

    // Convert user's cancel time to UTC
    const utcCancel = convertToUTC(validatedCancelDate, validatedCancelTime, timezone);
    if (!utcCancel) {
      return res.status(400).json({
        status: 400,
        message: "Failed to convert cancel time to UTC",
      });
    }

    console.log("🕒 Cancel Time Conversion:", {
      timezone: timezone,
      userDateTime: `${validatedCancelDate} ${validatedCancelTime}`,
      utcDateTime: `${utcCancel.utcDate} ${utcCancel.utcTime}`,
    });

    // ========== RETRIEVE STORED BOOKING TIME (IN UTC) ==========
    const storedOrderDate = goingbooking?.subCategories?.orderStartDate; // UTC
    const storedOrderTime = goingbooking?.subCategories?.orderStartTime; // UTC

    if (!storedOrderDate || !storedOrderTime) {
      return res.status(400).json({
        status: 400,
        message: "Booking order time not found",
      });
    }

    // ========== DATE VALIDATION (Compare in UTC) ==========
    const orderDateUTC = moment.utc(storedOrderDate, "YYYY-MM-DD");
    const cancelDateUTC = moment.utc(utcCancel.utcDate, "YYYY-MM-DD");

    // Optional: Check if cancelling on same day
    if (!orderDateUTC.isSame(cancelDateUTC, "day")) {
      console.log("⚠️ Warning: Cancel date does not match order date");
      // You can decide whether to allow or reject
      // return res.status(400).json({
      //   status: 400,
      //   message: "Cancel not allowed: Dates do not match",
      // });
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

    // ========== FETCH RELATED DATA ==========
    const getProbooking = await findOne("proBookingService", {
      bookServiceId: id,
    });

    const findPaymentMethod = await findOne("userPayment", {
      bookServiceId: getProbooking?._id,
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

    // 1️⃣ Provider-related issues (Manual decision)
    const providerIssues = [
      "Provider No Show",
      "Provider Delayed",
      "Provider Cancelled",
      "Provider Double Booked",
    ];

    if (providerIssues.includes(reasonCancel)) {
      console.log("📌 Provider Issue - Manual Review Required");

      await updateDocument(
        "proBookingService",
        { _id: getProbooking?._id },
        {
          status: "Cancelled",
          cancelledReason: "Cancelled By User - Provider Issue",
          CancelDate: utcCancel.utcDate,
          CancelTime: utcCancel.utcTime,
          cancelTimezone: timezone,
          reasonDescription,
          reasonCancel,
          amountReturn: "Manually decide",
          cancelledAt: new Date().toISOString(),
        }
      );

      const cancelbooking = await updateDocument(
        "userBookServ",
        { _id: id },
        {
          status: "Cancelled",
          cancelledReason: "Cancelled By User - Provider Issue",
          CancelDate: utcCancel.utcDate,
          CancelTime: utcCancel.utcTime,
          cancelTimezone: timezone,
          reasonDescription,
          reasonCancel,
          amountReturn: "Manually decide",
          cancelledAt: new Date().toISOString(),
        }
      );

      return res.status(200).json({
        status: 200,
        message: "Cancelled Booking - Manual Review Required",
        cancelbooking,
      });
    }

    // 2️⃣ Cancel more than 24 hours before (Refund service + platform fees)
    if (diffInHours > 24) {
      console.log("✅ Cancel >24hrs - Full refund minus payment fees");


      const baseServiceFee =
        Number(getProbooking?.service_fee || 0) +
        Number(getProbooking?.platformFees || 0);


      const cancelCharges = Number(findPaymentCharges || 0);

      // EMAIL SEND KARO - LINE 203 SE PEHLE
      await send_email(
        "userCancelFullRefund",
        {
          userName: findUser?.first_Name || "User", // goingbooking user ka data hai
          bookingId: goingbooking?.requestId,
          refundAmount: baseServiceFee.toFixed(2),
          paymentFee: findPaymentCharges.toFixed(2),
          totalRefund: baseServiceFee.toFixed(2),
          serviceName: goingbooking?.subCategories?.serviceType || "Service",
          proName: findPro?.first_Name || "Professional",
          bookingDate: `${storedOrderDate} at ${storedOrderTime}`,
          cancelReason: reasonCancel
        },
        process.env.SENDER_EMAIL,
        "Booking Cancelled - Full Refund Processed",
        findUser?.email // User ka email
      );

      await updateDocument(
        "proBookingService",
        { bookServiceId: id },
        {
          CancelCharges: cancelCharges,
          status: "Cancelled",
          cancelledReason: "Cancelled By User",
          CancelDate: utcCancel.utcDate,
          CancelTime: utcCancel.utcTime,
          cancelTimezone: timezone,
          priceToReturn: baseServiceFee,
          reasonDescription,
          reasonCancel,
          CancellationChargesApplyTo: "user",
          amountReturn: "user",
          ProfessionalPayableAmount: cancelCharges,
          cancelledAt: new Date().toISOString(),
        }
      );

      const cancelbooking = await updateDocument(
        "userBookServ",
        { _id: id },
        {
          status: "Cancelled",
          cancelledReason: "Cancelled By User",
          CancelDate: utcCancel.utcDate,
          CancelTime: utcCancel.utcTime,
          cancelTimezone: timezone,
          CancelCharges: cancelCharges,
          priceToReturn: baseServiceFee,
          reasonDescription,
          reasonCancel,
          CancellationChargesApplyTo: "user",
          amountReturn: "user",
          ProfessionalPayableAmount: cancelCharges,
          cancelledAt: new Date().toISOString(),
        }
      );

      console.log(goingbooking.userId, "goingbooking.userId");

      // Refund to user
      await updateDocument(
        "user",
        { _id: goingbooking.userId },
        {
          $inc: { currentBalance: baseServiceFee },
        }
      );

      return res.status(200).json({
        status: 200,
        message: "Cancelled Booking By User - Full Refund",
        cancelbooking,
        //  refundAmount: baseServiceFee,
      });
    }

    // 3️⃣ Cancel between 3-24 hours before (50% refund)
    if (diffInHours <= 24 && diffInHours > 3) {
      console.log("⚠️ Cancel 3-24hrs - 50% refund");

      const baseServiceFee =
        Number(getProbooking?.service_fee || 0) +
        Number(getProbooking?.platformFees || 0);

      let refundAmount = baseServiceFee * 0.5; // 50% refund
      let cancelCharges = baseServiceFee - refundAmount;

      // EMAIL SEND KARO - LINE 261 SE PEHLE
      await send_email(
        "userCancel50Refund",
        {
          userName: findUser?.first_Name || "User",
          bookingId: goingbooking?.requestId,
          originalAmount: baseServiceFee.toFixed(2),
          cancelFee: cancelCharges.toFixed(2),
          refundAmount: refundAmount.toFixed(2),
          serviceName: goingbooking?.subCategories?.serviceType || "Service",
          proName: findPro?.first_Name || "Professional",
          bookingDate: `${storedOrderDate} at ${storedOrderTime}`,
          cancelReason: reasonCancel
        },
        process.env.SENDER_EMAIL,
        "Booking Cancelled - 50% Refund Applied",
        findUser?.email // User ka email
      );

      await updateDocument(
        "proBookingService",
        { bookServiceId: id },
        {
          CancelCharges: cancelCharges,
          status: "Cancelled",
          cancelledReason: "Cancelled By User",
          CancelDate: utcCancel.utcDate,
          CancelTime: utcCancel.utcTime,
          cancelTimezone: timezone,
          priceToReturn: refundAmount,
          reasonDescription,
          reasonCancel,
          CancellationChargesApplyTo: "user",
          amountReturn: "user",
          ProfessionalPayableAmount: cancelCharges,
          cancelledAt: new Date().toISOString(),
        }
      );

      const cancelbooking = await updateDocument(
        "userBookServ",
        { _id: id },
        {
          status: "Cancelled",
          cancelledReason: "Cancelled By User",
          CancelDate: utcCancel.utcDate,
          CancelTime: utcCancel.utcTime,
          cancelTimezone: timezone,
          CancelCharges: cancelCharges,
          priceToReturn: refundAmount,
          reasonDescription,
          reasonCancel,
          CancellationChargesApplyTo: "user",
          amountReturn: "user",
          ProfessionalPayableAmount: cancelCharges,
          cancelledAt: new Date().toISOString(),
        }
      );

      // Refund 50% to user
      await updateDocument(
        "user",
        { _id: goingbooking.userId },
        {
          $inc: { currentBalance: refundAmount },
        }
      );

      return res.status(200).json({
        status: 200,
        message: "Cancelled Booking By User - 50% Refund",
        cancelbooking,
        //  refundAmount: refundAmount,
      });
    }

    // 4️⃣ Cancel less than 3 hours before (No refund - Pay pro)
    if (diffInHours <= 3 && diffInHours >= 0) {
      console.log("❌ Cancel <3hrs - No refund, pay to pro");

      const baseServiceFee = Number(getProbooking?.service_fee || 0);

      let cancelCharges =
        Number(getProbooking?.service_fee || 0) +
        Number(getProbooking?.platformFees || 0);

      // EMAIL SEND KARO - LINE 318 SE PEHLE
      await send_email(
        "userCancelNoRefund",
        {
          userName: findUser?.first_Name || "User",
          bookingId: goingbooking?.requestId,
          serviceFee: cancelCharges.toFixed(2),
          serviceName: goingbooking?.subCategories?.serviceType || "Service",
          proName: findPro?.first_Name || "Professional",
          bookingDate: `${storedOrderDate} at ${storedOrderTime}`,
          cancelReason: reasonCancel
        },
        process.env.SENDER_EMAIL,
        "Booking Cancelled - No Refund (Late Cancellation)",
        findUser?.email
      );

      await updateDocument(
        "proBookingService",
        { bookServiceId: id },
        {
          CancelCharges: cancelCharges,
          status: "Cancelled",
          cancelledReason: "Cancelled By User",
          CancelDate: utcCancel.utcDate,
          CancelTime: utcCancel.utcTime,
          cancelTimezone: timezone,
          priceToReturn: 0,
          reasonDescription,
          reasonCancel,
          CancellationChargesApplyTo: "user",
          amountReturn: "pro",
          ProfessionalPayableAmount: baseServiceFee,
          cancelledAt: new Date().toISOString(),
        }
      );

      const cancelbooking = await updateDocument(
        "userBookServ",
        { _id: id },
        {
          status: "Cancelled",
          cancelledReason: "Cancelled By User",
          CancelDate: utcCancel.utcDate,
          CancelTime: utcCancel.utcTime,
          cancelTimezone: timezone,
          CancelCharges: cancelCharges,
          priceToReturn: 0,
          reasonDescription,
          reasonCancel,
          CancellationChargesApplyTo: "user",
          amountReturn: "pro",
          ProfessionalPayableAmount: baseServiceFee,
          cancelledAt: new Date().toISOString(),
        }
      );

      // Pay professional
      if (goingbooking.professionalId) {
        await updateDocument(
          "user",
          { _id: goingbooking.professionalId },
          {
            $inc: { currentBalance: baseServiceFee },
          }
        );
      }

      return res.status(200).json({
        status: 200,
        message: "Cancelled Booking By User - No Refund",
        cancelbooking,
        //   refundAmount: 0,
      });
    }

    // 5️⃣ Special reasons (Manual decision)
    const specialReasons = [
      "Change of Plans",
      "Delayed Need",
      "Emergency Situation",
      "Financial Reasons",
      "Found an Alternative Solution",
      "Schedule Conflict",
      "Service No Longer Needed",
      "Unsatisfactory Provider Options",
      "Booking Time End",
      "Rescheduling",
    ];

    if (specialReasons.includes(reasonCancel)) {
      console.log("📌 Special Reason - Manual Review Required");

      // EMAIL SEND KARO - LINE 398 KE BAAD
      await send_email(
        "userProCancel",
        {
          userName: findUser?.first_Name || "User",
          bookingId: goingbooking?.requestId,
          // refundAmount: proBookingTotal.toFixed(2),
          serviceName: goingbooking?.subCategories?.serviceType || "Service",
          proName: findPro?.first_Name || "Professional",
          bookingDate: `${storedOrderDate} at ${storedOrderTime}`,
          cancelReason: reasonCancel || "Professional cancelled"
        },
        process.env.SENDER_EMAIL,
        "Booking Cancelled by User - Full Refund Issued",
        findUser?.email
      );

      await updateDocument(
        "proBookingService",
        { _id: getProbooking?._id },
        {
          status: "Cancelled",
          cancelledReason: "Cancelled By User - Special Reason",
          CancelDate: utcCancel.utcDate,
          CancelTime: utcCancel.utcTime,
          cancelTimezone: timezone,
          reasonDescription,
          reasonCancel,
          amountReturn: "Manually decide",
          cancelledAt: new Date().toISOString(),
        }
      );

      const cancelbooking = await updateDocument(
        "userBookServ",
        { _id: id },
        {
          status: "Cancelled",
          cancelledReason: "Cancelled By User - Special Reason",
          CancelDate: utcCancel.utcDate,
          CancelTime: utcCancel.utcTime,
          cancelTimezone: timezone,
          reasonDescription,
          reasonCancel,
          amountReturn: "Manually decide",
          cancelledAt: new Date().toISOString(),
        }
      );

      return res.status(200).json({
        status: 200,
        message: "Cancelled Booking - Manual Review Required",
        cancelbooking,
      });
    }

    // 6️⃣ Default case - Professional cancelled
    console.log("📌 Default - Professional Cancelled");

    await updateDocument(
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

    const cancelbooking = await updateDocument(
      "userBookServ",
      {
        _id: id,
        status: { $in: ["Accepted", "Pending"] },
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
    console.error("❌ Cancel Booking Error:", e);
    return res.status(400).json({ status: 400, message: e.message });
  }
};

export default cancelledBooking;