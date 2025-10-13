import Joi from "joi";
import moment from "moment";
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
    const goingbooking = await findOne("proBookingService", { _id: id });

    if (!goingbooking || goingbooking.length == 0) {
      return res
        .status(400)
        .json({ status: 400, message: "No Booking Found!" });
    }



    const orderDate = moment(goingbooking.orderStartDate, "YYYY-MM-DD");
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
      `${goingbooking.orderStartDate}T${goingbooking.orderStartTime}`
    );
    console.log("startTime", startTime);

    const cancelTime = moment(`${CancelDate}T${CancelTime}`);
    console.log("cancelTime", cancelTime);
    const diffInHours = startTime.diff(cancelTime, "hours", true);
    console.log("diffInHours", diffInHours);

     const findPaymentMethod = await findOne("userPayment", { bookServiceId: id });

let findPaymentCharges = findPaymentMethod?.paymentMethod == "Paypal" ? paypalFixedFee + paypalFeePercentage : stripeFeePercentage + stripeFixedFee
    // * Agr user meeting mein nhi aye *// 
    if (
      reasonCancel == "User No Show" ||
      "User Cancelled" ||
      "User Did Not Respond"
    ) {
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
          amountReturn: "Manually decide",
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
          amountReturn: "Manually decide",
          //  ProfessionalPayableAmount: cancelCharges,
        }
      );
      return res.status(200).json({
        status: 200,
        message: "Cancelled Booking By Professional",
        cancelbooking,
      });
    } //  ** pro cancel less than 3 hour  **//
    else if (diffInHours < 3) {
      //refund isInPerson charges Pro
      if (goingbooking.serviceType == "isInPerson") {
        console.log("isInPerson");
        const orderDate = moment(goingbooking.orderStartDate, "YYYY-MM-DD");
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
          `${goingbooking.orderStartDate}T${goingbooking.orderStartTime}`
        );
        console.log("startTime", startTime);

        const cancelTime = moment(`${CancelDate}T${CancelTime}`);
        console.log("cancelTime", cancelTime);
        const diffInHours = startTime.diff(cancelTime, "hours", true);
        console.log("diffInHours", diffInHours);
        // Charges base (In-Person ke liye service_fee + platformFees)
        const baseServiceFee =
          Number(goingbooking?.service_fee || 0)  +
          Number(goingbooking?.platformFees || 0) + 
          Number(findPaymentCharges || 0) ;
        console.log("baseServiceFee", baseServiceFee);
        let cancelCharges = 0;

        //** Rule for In-Person Services (less than 3 hour to startBooking)
         // charges include = service fees + platform commission **//
        if (goingbooking.serviceType == "isInPerson") {
          let cancelbooking;
          // baseServiceFee not more than $100
          if (diffInHours < 3) {
            //cancelCharges = baseServiceFee * 0.5;
            // ** agar result 100 se zyada hua to 100 le lega, warna actual value.
            const cancelCharges = Math.min(baseServiceFee * 0.5, 100);
            console.log("cancelCharges", cancelCharges);
            //proBooking update
            cancelbooking = await updateDocument(
              "proBookingService",
              { _id: id },
              {
                CancelCharges: cancelCharges,
                status: "Cancelled",
                cancelledReason: "Cancelled By Professional",
                CancelDate,
                CancelTime,
                priceToReturn:baseServiceFee,
                reasonDescription,
                reasonCancel,
                CancellationChargesApplyTo: "pro",
                amountReturn: "user",
                ProfessionalPayableAmount: cancelCharges,
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
                status: "Cancelled",
                cancelledReason: "Cancelled By Professional",
                CancelDate,
                CancelTime,
                CancelCharges: cancelCharges,
                priceToReturn: baseServiceFee,
                reasonDescription,
                reasonCancel,
                CancellationChargesApplyTo: "pro",
                amountReturn: "user",
                ProfessionalPayableAmount: cancelCharges,
              }
            );
            // pro TotalCharges update
            const proTotalCharges = await updateDocument(
              "user",
              { _id: goingbooking.professsionalId },
              {
                $inc: { totalCharges: cancelCharges },
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
            // if (cancelCharges > 100) {
            //   // baseServiceFee  more than $100
            //   console.log("100", cancelCharges);
            //   cancelCharges = 100;
            //   cancelbooking = await updateDocument(
            //     "proBookingService",
            //     { _id: id },
            //     {
            //       CancelCharges: cancelCharges,
            //       status: "Cancelled",
            //       cancelledReason: "Cancelled By Professional",
            //       CancelDate,
            //       CancelTime,
            //       priceToReturn: goingbooking?.total_amount,
            //       reasonDescription,
            //       reasonCancel,
            //       CancellationChargesApplyTo: "pro",
            //       amountReturn: "user",
            //       ProfessionalPayableAmount: cancelCharges,
            //     }
            //   );

            //   const cancelRandomProBooking = await updateDocument(
            //     "userBookServ",
            //     {
            //       _id: cancelbooking?.bookServiceId,
            //       status: { $in: ["Accepted", "Pending"] },
            //     },
            //     {
            //       status: "Cancelled",
            //       cancelledReason: "Cancelled By Professional",
            //       CancelDate,
            //       CancelTime,
            //       CancelCharges: cancelCharges,
            //       priceToReturn: goingbooking?.total_amount,
            //       reasonDescription,
            //       reasonCancel,
            //       CancellationChargesApplyTo: "pro",
            //       amountReturn: "user",
            //       ProfessionalPayableAmount: cancelCharges,
            //     }
            //   );
            //   // pro TotalCharges update
            //   const proTotalCharges = await updateDocument(
            //     "user",
            //     { _id: goingbooking.professsionalId },
            //     {
            //       $inc: { chargesAmount: cancelCharges },
            //     }
            //   );
            //   // admin add to user to return payment
            //   const adminReturnToUserAmt = await updateDocument(
            //     "user",
            //     { _id: goingbooking.userId },
            //     {
            //       $inc: { pendingAmount: goingbooking?.total_amount },
            //     }
            //   );
            // }
          }
          return res.status(200).json({
            status: 200,
            message: "Cancelled Booking By Professional",
            cancelbooking,
          });
        }
      }

      // ** ----------------  refund isVirtual charges Pro   ------------------- **//
      else if (goingbooking.serviceType == "isVirtual") {
        console.log("isVirtual");
        const orderDate = moment(goingbooking.orderStartDate, "YYYY-MM-DD");
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
          `${goingbooking.orderStartDate}T${goingbooking.orderStartTime}`
        );
        console.log("startTime", startTime);

        const cancelTime = moment(`${CancelDate}T${CancelTime}`);
        console.log("cancelTime", cancelTime);
        const diffInHours = startTime.diff(cancelTime, "hours", true);
        console.log("diffInHours", diffInHours);
        // Charges base (isVirtual ke liye service_fee + platformFees)
        const baseServiceFee =
           Number(goingbooking?.service_fee || 0)  +
          Number(goingbooking?.platformFees || 0) + 
          Number(findPaymentCharges || 0) ;
        console.log("baseServiceFee", baseServiceFee);
        let cancelCharges = 0;

        // Rule for isVirtual Services (less than 3 hour to startBooking)
        if (goingbooking.serviceType == "isVirtual") {
          let cancelbooking;
          // baseServiceFee not more than $100
          if (diffInHours < 3) {
            cancelCharges = baseServiceFee * 0.5;
            console.log("cancelCharges", cancelCharges);
            //proBooking update
            cancelbooking = await updateDocument(
              "proBookingService",
              { _id: id },
              {
                CancelCharges: cancelCharges,
                status: "Cancelled",
                cancelledReason: "Cancelled By Professional",
                CancelDate,
                CancelTime,
                priceToReturn: baseServiceFee,
                reasonDescription,
                reasonCancel,
                CancellationChargesApplyTo: "pro",
                amountReturn: "user",
                ProfessionalPayableAmount: cancelCharges,
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
                status: "Cancelled",
                cancelledReason: "Cancelled By Professional",
                CancelDate,
                CancelTime,
                CancelCharges: cancelCharges,
                priceToReturn: baseServiceFee,
                reasonDescription,
                reasonCancel,
                CancellationChargesApplyTo: "pro",
                amountReturn: "user",
                ProfessionalPayableAmount: cancelCharges,
              }
            );
            // pro TotalCharges update
            const proTotalCharges = await updateDocument(
              "user",
              { _id: goingbooking.professsionalId },
              {
                $inc: { totalCharges: cancelCharges },
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
          }
          return res.status(200).json({
            status: 200,
            message: "Cancelled Booking By Professional",
            cancelbooking,
          });
        }
      }

      // ** ------ refund isChat charges Pro ---   ** //
      else if (goingbooking.serviceType == "isChat") {
        console.log("isChat");
        const orderDate = moment(goingbooking.orderStartDate, "YYYY-MM-DD");
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
          `${goingbooking.orderStartDate}T${goingbooking.orderStartTime}`
        );
        console.log("startTime", startTime);

        const cancelTime = moment(`${CancelDate}T${CancelTime}`);
        console.log("cancelTime", cancelTime);
        const diffInHours = startTime.diff(cancelTime, "hours", true);
        console.log("diffInHours", diffInHours);
        // Charges base (isChat ke liye service_fee + platformFees)
        const baseServiceFee =
          Number(goingbooking?.service_fee || 0)  +
          Number(goingbooking?.platformFees || 0) + 
          Number(findPaymentCharges || 0) ;
        console.log("baseServiceFee", baseServiceFee);
        let cancelCharges = 0;

        // Rule for isVirtual Services (less than 3 hour to startBooking)
        if (goingbooking.serviceType == "isChat") {
          let cancelbooking;
          // baseServiceFee not more than $100
          if (diffInHours < 3) {
            // ** add 10 + payment charges
            cancelCharges = 10 +  Number(findPaymentCharges || 0);
            console.log("cancelCharges", cancelCharges);
            //proBooking update
            cancelbooking = await updateDocument(
              "proBookingService",
              { _id: id },
              {
                CancelCharges: cancelCharges,
                status: "Cancelled",
                cancelledReason: "Cancelled By Professional",
                CancelDate,
                CancelTime,
                priceToReturn: baseServiceFee,
                reasonDescription,
                reasonCancel,
                CancellationChargesApplyTo: "pro",
                amountReturn: "user",
                ProfessionalPayableAmount: cancelCharges,
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
                status: "Cancelled",
                cancelledReason: "Cancelled By Professional",
                CancelDate,
                CancelTime,
                CancelCharges: cancelCharges,
                priceToReturn:baseServiceFee,
                reasonDescription,
                reasonCancel,
                CancellationChargesApplyTo: "pro",
                amountReturn: "user",
                ProfessionalPayableAmount: cancelCharges,
              }
            );
            // pro TotalCharges update
            const proTotalCharges = await updateDocument(
              "user",
              { _id: goingbooking.professsionalId },
              {
                $inc: { totalCharges: cancelCharges },
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
          }
          return res.status(200).json({
            status: 200,
            message: "Cancelled Booking By Professional",
            cancelbooking,
          });
        }
      }

      // ** ------------------ refund isRemote charges Pro ------ **//
      else if (goingbooking.serviceType == "isRemote") {
        console.log("isRemote");
        const orderDate = moment(goingbooking.orderStartDate, "YYYY-MM-DD");
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
          `${goingbooking.orderStartDate}T${goingbooking.orderStartTime}`
        );
        console.log("startTime", startTime);

        const cancelTime = moment(`${CancelDate}T${CancelTime}`);
        console.log("cancelTime", cancelTime);
        const diffInHours = startTime.diff(cancelTime, "hours", true);
        console.log("diffInHours", diffInHours);
        // Charges base (isRemote ke liye service_fee + platformFees)
        const baseServiceFee =  Number(goingbooking?.service_fee || 0)  +
          Number(goingbooking?.platformFees || 0) + 
          Number(findPaymentCharges || 0) ;
        console.log("baseServiceFee", baseServiceFee);

        console.log("baseServiceFee", baseServiceFee);
        let cancelCharges = 0;

        // Rule for isVirtual Services (less than 3 hour to startBooking)
        if (goingbooking.serviceType == "isRemote") {
          let cancelbooking;
          // baseServiceFee service fees ka $20 %
          if (diffInHours < 3) {
            // ** service fees 20 % + platform fees
            cancelCharges = (goingbooking?.service_fee * 0.2) +  Number(findPaymentCharges || 0) ;
            console.log("cancelCharges", cancelCharges);
            //proBooking update
            cancelbooking = await updateDocument(
              "proBookingService",
              { _id: id },
              {
                CancelCharges: cancelCharges,
                status: "Cancelled",
                cancelledReason: "Cancelled By Professional",
                CancelDate,
                CancelTime,
                priceToReturn: baseServiceFee,
                reasonDescription,
                reasonCancel,
                CancellationChargesApplyTo: "pro",
                amountReturn: "user",
                ProfessionalPayableAmount: cancelCharges,
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
                status: "Cancelled",
                cancelledReason: "Cancelled By Professional",
                CancelDate,
                CancelTime,
                CancelCharges: cancelCharges,
                priceToReturn: baseServiceFee,
                reasonDescription,
                reasonCancel,
                CancellationChargesApplyTo: "pro",
                amountReturn: "user",
                ProfessionalPayableAmount: cancelCharges,
              }
            );
            // pro TotalCharges update
            const proTotalCharges = await updateDocument(
              "user",
              { _id: goingbooking.professsionalId },
              {
                $inc: { totalCharges: cancelCharges },
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
          }
          return res.status(200).json({
            status: 200,
            message: "Cancelled Booking By Professional",
            cancelbooking,
          });
        }
      }
    }

    return res.status(400).json({
      status: 400,
      message: "Booking Not Found!",
    });
  } catch (e) {
    console.log(e);
    return res.status(400).json({ status: 400, message: e.message });
  }
};

export default cancelledBooking;
