import Joi from "joi";
import { findOne, updateDocument } from "../../../helpers/index.js";

const schema = Joi.object().keys({
  id: Joi.string().required(),
});

const schemaBody = Joi.object().keys({
  CancelDate: Joi.string().required(),
  CancelTime: Joi.string().required(),
  reasonDescription: Joi.string(),
  reasonCancel: Joi.string().required(),
});

const cancelledBooking = async (req, res) => {
  try {
    await schema.validateAsync(req.params);
    await schemaBody.validateAsync(req.body);
    const { id } = req.params;
    const { CancelDate, CancelTime, reasonDescription, reasonCancel } =
      req.body;
    const goingbooking = await findOne("userBookServ", { _id: id });

    if (!goingbooking || goingbooking.length == 0) {
      return res
        .status(400)
        .json({ status: 400, message: "No Booking Found!" });
    }

    const orderDate = moment(
      goingbooking?.subCategories?.orderStartDate,
      "YYYY-MM-DD"
    );
    const cancelDate = moment(CancelDate, "YYYY-MM-DD");

    if (!orderDate.isSame(cancelDate, "day")) {
      return res.json({
        status: 400,
        message: "Cancel not allowed: Dates do not match",
      });
    }

    console.log("Cancel allowed: Dates match");
    // cancel and start time banani hai
    const startTime = moment(
      `${goingbooking?.subCategories?.orderStartDate}T${goingbooking?.subCategories?.orderStartTime}`
    );
    console.log("startTime", startTime);

    const cancelTime = moment(`${CancelDate}T${CancelTime}`);
    console.log("cancelTime", cancelTime);
    const diffInHours = startTime.diff(cancelTime, "hours", true);
    console.log("diffInHours", diffInHours);

    const getProbooking = await findOne("proBookingService", {
      bookServiceId: id,
    });
    const findPaymentMethod = await findOne("userPayment", {
      bookServiceId: getProbooking?._id,
    });

    let findPaymentCharges =
      findPaymentMethod?.paymentMethod == "Paypal"
        ? paypalFixedFee + paypalFeePercentage
        : stripeFeePercentage + stripeFixedFee;
    // * Agr user meeting mein nhi aye *//
    if (
      reasonCancel == "Provider No Show" ||
      "Provider Delayed" ||
      "Provider Cancelled" ||
      "Provider Double Booked"
    ) {
      //proBooking update
      let cancelbooking = await updateDocument(
        "proBookingService",
        { _id: getProbooking?._id },
        {
          //  CancelCharges: cancelCharges,
          status: "Cancelled",
          cancelledReason: "Cancelled By User",
          CancelDate,
          CancelTime,
          // priceToReturn: goingbooking?.total_amount,
          reasonDescription,
          reasonCancel,
          //  CancellationChargesApplyTo: "pro",
          amountReturn: "Manually decide",
          //  ProfessionalPayableAmount: cancelCharges,
        }
      );
      // userBooking update
      const cancelRandomProBooking = await updateDocument(
        "userBookServ",
        {
          _id: id,
          // status: { $in: ["Accepted", "Pending"] },
        },
        {
          //  CancelCharges: cancelCharges,
          status: "Cancelled",
          cancelledReason: "Cancelled By User",
          CancelDate,
          CancelTime,
          // priceToReturn: goingbooking?.total_amount,
          reasonDescription,
          reasonCancel,
          //  CancellationChargesApplyTo: "pro",
          amountReturn: "Manually decide",
          //  ProfessionalPayableAmount: cancelCharges,
        }
      );
      return res.status(200).json({
        status: 200,
        message: "Cancelled Booking By User",
        cancelbooking,
      });
    }
    // ** user cancel more than 24 hour ""//
    //** deduct payment fees only */
    // ** given back service fees + paltforn fess **//
    else if (diffInHours > 24) {
      const baseServiceFee =
        Number(goingbooking?.service_fee || 0) +
        Number(goingbooking?.platformFees || 0);

      console.log("baseServiceFee", baseServiceFee);

      //cancelCharges = payment platform fees;

      const cancelCharges = Number(findPaymentCharges || 0);
      console.log("cancelCharges", cancelCharges);
      //proBooking update
      let cancelbooking = await updateDocument(
        "proBookingService",
        { bookServiceId: id },
        {
          CancelCharges: cancelCharges,
          status: "Cancelled",
          cancelledReason: "Cancelled By User",
          CancelDate,
          CancelTime,
          priceToReturn: baseServiceFee,
          reasonDescription,
          reasonCancel,
          CancellationChargesApplyTo: "user",
          amountReturn: "user",
          ProfessionalPayableAmount: cancelCharges,
        }
      );
      // userBooking update
      const cancelRandomProBooking = await updateDocument(
        "userBookServ",
        {
          _id: id,
          //  status: { $in: ["Accepted", "Pending"] },
        },
        {
          status: "Cancelled",
          cancelledReason: "Cancelled By User",
          CancelDate,
          CancelTime,
          CancelCharges: cancelCharges,
          priceToReturn: baseServiceFee,
          reasonDescription,
          reasonCancel,
          CancellationChargesApplyTo: "user",
          amountReturn: "user",
          ProfessionalPayableAmount: cancelCharges,
        }
      );

      // admin add to user to return payment
      const adminReturnToUserAmt = await updateDocument(
        "user",
        { _id: goingbooking.userId },
        {
          $inc: { currentBalance: baseServiceFee },
        }
      );

      return res.status(200).json({
        status: 200,
        message: "Cancelled Booking By User",
        cancelbooking,
      });
    } // ** user cancel before than 24 hour and more than 3 hours ""//
    //** deduct 50%overall amount */
    // ** given back remianing fees **//
    else if (diffInHours <= 24 && diffInHours > 3) {
      // ⚠️ 50% refund (basic fees only)
      const baseServiceFee =
        Number(goingbooking?.service_fee || 0) +
        Number(goingbooking?.platformFees || 0);

      console.log("baseServiceFee", baseServiceFee);

      let refundAmount = baseServiceFee * 0.5; // 50% of basic fees

      //cancelCharges = payment platform fees;

      //console.log("cancelCharges", cancelCharges);
      // ** totalAmount jo user ne pay ke the is mein se 50% cut kr ke jo amount a rhe hain woh likh de
      let cancelCharges = baseServiceFee - refundAmount;

      //proBooking update
      let cancelbooking = await updateDocument(
        "proBookingService",
        { bookServiceId: id },
        {
          CancelCharges: cancelCharges,
          status: "Cancelled",
          cancelledReason: "Cancelled By User",
          CancelDate,
          CancelTime,
          priceToReturn: refundAmount,
          reasonDescription,
          reasonCancel,
          CancellationChargesApplyTo: "user",
          amountReturn: "user",
          ProfessionalPayableAmount: cancelCharges,
        }
      );
      // userBooking update
      const cancelRandomProBooking = await updateDocument(
        "userBookServ",
        {
          _id: id,
          //  status: { $in: ["Accepted", "Pending"] },
        },
        {
          status: "Cancelled",
          cancelledReason: "Cancelled By User",
          CancelDate,
          CancelTime,
          CancelCharges: cancelCharges,
          priceToReturn: refundAmount,
          reasonDescription,
          reasonCancel,
          CancellationChargesApplyTo: "user",
          amountReturn: "user",
          ProfessionalPayableAmount: cancelCharges,
        }
      );

      // admin add to user to return payment
      const adminReturnToUserAmt = await updateDocument(
        "user",
        { _id: goingbooking.userId },
        {
          $inc: { currentBalance: refundAmount },
        }
      );

      return res.status(200).json({
        status: 200,
        message: "Cancelled Booking By User",
        cancelbooking,
      });
    }
    // ** user cancel before 3 hour ""//
    //** deduct 100%overall amount */
    // ** give service fees to the pro **//
    else if (diffInHours < 3) {
      // ⚠️ 100% service fees credit to pro
      const baseServiceFee = Number(goingbooking?.service_fee || 0);

      console.log("baseServiceFee", baseServiceFee);

      let cancelCharges =
        Number(goingbooking?.service_fee || 0) +
        Number(goingbooking?.platformFees || 0);

      //proBooking update
      let cancelbooking = await updateDocument(
        "proBookingService",
        { bookServiceId: id },
        {
          CancelCharges: cancelCharges,
          status: "Cancelled",
          cancelledReason: "Cancelled By User",
          CancelDate,
          CancelTime,
          priceToReturn: 0,
          reasonDescription,
          reasonCancel,
          CancellationChargesApplyTo: "user",
          amountReturn: "user",
          ProfessionalPayableAmount: cancelCharges,
        }
      );
      // userBooking update
      const cancelRandomProBooking = await updateDocument(
        "userBookServ",
        {
          _id: id,
          //  status: { $in: ["Accepted", "Pending"] },
        },
        {
          status: "Cancelled",
          cancelledReason: "Cancelled By User",
          CancelDate,
          CancelTime,
          CancelCharges: cancelCharges,
          priceToReturn: 0,
          reasonDescription,
          reasonCancel,
          CancellationChargesApplyTo: "user",
          amountReturn: "user",
          ProfessionalPayableAmount: cancelCharges,
        }
      );

      // admin add to user to return payment
      const adminReturnToUserAmtToPro = await updateDocument(
        "user",
        { _id: goingbooking.professionalId },
        {
          $inc: { currentBalance: baseServiceFee },
        }
      );

      return res.status(200).json({
        status: 200,
        message: "Cancelled Booking By User",
        cancelbooking,
      });
    }
    // ** Medical Emergency mein cancel kr de booking toh manually dekhe ga admin.
    else if (
      reasonCancel == "Change of Plans" ||
      "Delayed Need" ||
      "Emergency Situation" ||
      "Financial Reasons" ||
      "Found an Alternative Solution" ||
      "Schedule Conflict" ||
      "Service No Longer Needed" ||
      "Unsatisfactory Provider Options" ||
      "Booking Time End" ||
      "Rescheduling"
    ) {
      //proBooking update
      let cancelbooking = await updateDocument(
        "proBookingService",
        { _id: getProbooking?._id },
        {
          //  CancelCharges: cancelCharges,
          status: "Cancelled",
          cancelledReason: "Cancelled By User",
          CancelDate,
          CancelTime,
          // priceToReturn: goingbooking?.total_amount,
          reasonDescription,
          reasonCancel,
          //  CancellationChargesApplyTo: "pro",
          amountReturn: "Manually decide",
          //  ProfessionalPayableAmount: cancelCharges,
        }
      );
      // userBooking update
      const cancelRandomProBooking = await updateDocument(
        "userBookServ",
        {
          _id: id,
          // status: { $in: ["Accepted", "Pending"] },
        },
        {
          //  CancelCharges: cancelCharges,
          status: "Cancelled",
          cancelledReason: "Cancelled By User",
          CancelDate,
          CancelTime,
          // priceToReturn: goingbooking?.total_amount,
          reasonDescription,
          reasonCancel,
          //  CancellationChargesApplyTo: "pro",
          amountReturn: "Manually decide",
          //  ProfessionalPayableAmount: cancelCharges,
        }
      );
      return res.status(200).json({
        status: 200,
        message: "Cancelled Booking By User",
        cancelbooking,
      });
    } else {
      //proBooking update
      let cancelbooking = await updateDocument(
        "proBookingService",
        { _id: id },
        {
          //  CancelCharges: cancelCharges,
          status: "Cancelled",
          cancelledReason: "Cancelled By Professional",
          CancelDate,
          CancelTime,
          // priceToReturn: goingbooking?.total_amount,
          reasonDescription,
          reasonCancel,
          //  CancellationChargesApplyTo: "pro",
          // amountReturn: "Manually decide",
          //  ProfessionalPayableAmount: cancelCharges,
        }
      );
      // userBooking update
      const cancelRandomProBooking = await updateDocument(
        "userBookServ",
        {
          _id: cancelbooking?.bookServiceId,
          status: { $in: ["Accepted", "Pending"] },
        },
        {
          //  CancelCharges: cancelCharges,
          status: "Cancelled",
          cancelledReason: "Cancelled By Professional",
          CancelDate,
          CancelTime,
          // priceToReturn: goingbooking?.total_amount,
          reasonDescription,
          reasonCancel,
          //  CancellationChargesApplyTo: "pro",
          // amountReturn: "Manually decide",
          //  ProfessionalPayableAmount: cancelCharges,
        }
      );
      return res.status(200).json({
        status: 200,
        message: "Cancelled Booking By Professional",
        cancelbooking,
      });
    }

    // const cancelbooking = await updateDocument(
    //   "userBookServ",
    //   { _id: id },
    //   { status: "Cancelled", cancelledReason: "Cancelled By User",CancelDate,CancelTime }
    // );

    // if (!cancelbooking) {
    //   return res
    //   .status(400)
    //   .json({ status: 400, message: "No Booking Found!" });
    // }

    // const cancelRandomProBooking = await updateDocument(
    //   "proBookingService",
    //   { bookServiceId: id,status:{$in:["Accepted","Pending"]}},
    //   { status: "Cancelled", cancelledReason: "Cancelled By User",CancelDate,CancelTime }
    // );

    // return res
    //   .status(200)
    //   .json({
    //     status: 200,
    //     message: "Cancelled Booking By User",
    //     cancelbooking,
    //   });
  } catch (e) {
    return res.status(400).json({ status: 400, message: e.message });
  }
};

export default cancelledBooking;
