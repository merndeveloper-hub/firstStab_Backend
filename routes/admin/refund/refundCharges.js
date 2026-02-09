import Joi from "joi";
import { findOne, updateDocument } from "../../../helpers/index.js";

const schemaBody = Joi.object().keys({
  CancelCharges: Joi.object({
    service_fee_charge: Joi.number().required(),
    platformFees_charge: Joi.number().required(),
    findPaymentCharges_charge: Joi.number().required(),
  }).required(),
  bookingFees: Joi.object({
    service_fee: Joi.number().required(),
    platformFees: Joi.number().required(),
    findPaymentCharges: Joi.number().required(),
  }).required(),
  CancellationChargesApplyTo: Joi.string().valid("Client", "Pro").required(),
  amountReturn: Joi.string().valid("Client", "Pro").required(),
  reason: Joi.string(),
  id: Joi.string().required(),
});

const refundBookingAmtDecide = async (req, res) => {
  try {

    await schemaBody.validateAsync(req.body);

    const {
      id,
      reason,
      CancelCharges,
      bookingFees,
      CancellationChargesApplyTo,
      amountReturn,
    } = req.body;
    const getProbooking = await findOne("proBookingService", {
      _id: id,
    });

    if (!getProbooking || getProbooking.length == 0) {
      return res
        .status(400)
        .json({ status: 400, message: "No Booking Found!" });
    }

    const goingbooking = await findOne("userBookServ", {
      _id: getProbooking?.bookServiceId,
    });
    const findPaymentMethod = await findOne("userPayment", {
      bookServiceId: getProbooking?._id,
    });

    const adminCharges = await findOne("adminFees");

    let findPaymentCharges =
      findPaymentMethod?.paymentMethod == "Paypal"
        ? adminCharges.paypalFixedFee + adminCharges.paypalFeePercentage
        : adminCharges.stripeFeePercentage + adminCharges.stripeFixedFee;

    // Calculate total cancel charges from payload
    const totalCancelCharges =
      Number(getProbooking?.service_fee * CancelCharges.service_fee_charge) +
      Number(getProbooking?.platformFees * CancelCharges.platformFees_charge) +
      Number(findPaymentCharges * CancelCharges.findPaymentCharges_charge);

    // Calculate base service fee from bookingFees
    const baseServiceFee =
      Number(getProbooking?.service_fee * bookingFees.service_fee) +
      Number(getProbooking?.platformFees * bookingFees.platformFees) +
      Number(findPaymentCharges * bookingFees.findPaymentCharges);

    console.log("totalCancelCharges", totalCancelCharges);
    console.log("baseServiceFee", baseServiceFee);

    //proBooking update
    let cancelbooking = await updateDocument(
      "proBookingService",
      { _id: id },
      {
        CancelCharges: totalCancelCharges,

        priceToReturn: baseServiceFee,
        status:"Completed",
        refundReason: reason,
        CancellationChargesApplyTo,
        amountReturn,
      }
    );

    // userBooking update
    const cancelRandomProBooking = await updateDocument(
      "userBookServ",
      {
        _id: getProbooking?.bookServiceId,
      },
      {
        CancelCharges: totalCancelCharges,

        priceToReturn: baseServiceFee,
        status:"Completed",
        refundReason: reason,
        CancellationChargesApplyTo,
        amountReturn,
      }
    );

    // Admin balance update logic
    // If amountReturn is 'pro', add to professional's balance
    if (amountReturn == "Pro") {
      await updateDocument(
        "user",
        { _id: getProbooking.professsionalId },
        {
          $inc: { currentBalance: baseServiceFee },
        }
      );
    } else if (amountReturn == "Client") {
      await updateDocument(
        "user",
        { _id: getProbooking.userId },
        {
          $inc: { currentBalance: baseServiceFee },
        }
      );
    } else if (CancellationChargesApplyTo == "Client") {
      await updateDocument(
        "user",
        { _id: getProbooking.userId },
        {
          $inc: { totalCharges: totalCancelCharges },
        }
      );
    } else if (CancellationChargesApplyTo == "Pro") {
      await updateDocument(
        "user",
        { _id: getProbooking.professsionalId },
        {
          $inc: { totalCharges: totalCancelCharges },
        }
      );
    }

    return res.status(200).json({
      status: 200,
      message: "Successfully Send!"
    });
  } catch (e) {
    return res.status(400).json({ status: 400, message: e.message });
  }
};

export default refundBookingAmtDecide;
