import Joi from "joi";
import moment from "moment";
import { findOne, updateDocument } from "../../../helpers/index.js";

const schema = Joi.object().keys({
  id: Joi.string().required(),
});

const schemaBody = Joi.object().keys({
  CancelDate: Joi.string().required(),
  CancelTime: Joi.string().required(),
});

const cancelledBooking = async (req, res) => {
  try {
    await schema.validateAsync(req.params);
    await schemaBody.validateAsync(req.body);
    const { id } = req.params;

    const { CancelDate, CancelTime } = req.body;
    const goingbooking = await findOne("proBookingService", { _id: id });

    if (!goingbooking || goingbooking.length == 0) {
      return res
        .status(400)
        .json({ status: 400, message: "No Booking Found!" });
    }

    //refund isInPerson charges Pro
    if (goingbooking.serviceType == "isInPerson") {
      console.log("isInPerson");
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
        Number(goingbooking?.service_fee || 0) +
        Number(goingbooking?.platformFees || 0);
      console.log("baseServiceFee", baseServiceFee);
      let cancelCharges = 0;

      // Rule for In-Person Services (less than 3 hour to startBooking)
      if (goingbooking.serviceType == "isInPerson") {
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
              $inc: { CancelCharges: cancelCharges },
              status: "Cancelled",
              cancelledReason: "Cancelled By Professional",
              CancelDate,
              CancelTime,
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
              $inc: { CancelCharges: cancelCharges },
            }
          );
          // pro TotalCharges update
          const proTotalCharges = await updateDocument(
            "user",
            { _id: goingbooking.professsionalId },
            {
              $inc: { chargesAmount: cancelCharges },
            }
          );

          if (cancelCharges > 100) {
            // baseServiceFee  more than $100
            console.log("100", cancelCharges);
            cancelCharges = 100;
            cancelbooking = await updateDocument(
              "proBookingService",
              { _id: id },
              {
                $inc: { CancelCharges: cancelCharges },
                status: "Cancelled",
                cancelledReason: "Cancelled By Professional",
                CancelDate,
                CancelTime,
              }
            );

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
                $inc: { CancelCharges: cancelCharges },
              }
            );
          }
        }
        return res.status(200).json({
          status: 200,
          message: "Cancelled Booking By Professional",
          cancelbooking,
        });
      }
    }   
    //refund isVirtual charges Pro
    else if (goingbooking.serviceType == "isVirtual") {
      console.log("isVirtual");
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
        Number(goingbooking?.service_fee || 0) +
        Number(goingbooking?.platformFees || 0);
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
              $inc: { CancelCharges: cancelCharges },
              status: "Cancelled",
              cancelledReason: "Cancelled By Professional",
              CancelDate,
              CancelTime,
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
              $inc: { CancelCharges: cancelCharges },
            }
          );
          // pro TotalCharges update
          const proTotalCharges = await updateDocument(
            "user",
            { _id: goingbooking.professsionalId },
            {
              $inc: { chargesAmount: cancelCharges },
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
//refund isChat charges Pro
    else if (goingbooking.serviceType == "isChat") {
      console.log("isChat");
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
      // const baseServiceFee =
      //   Number(goingbooking?.service_fee || 0) +
      //   Number(goingbooking?.platformFees || 0);
      // console.log("baseServiceFee", baseServiceFee);
       let cancelCharges = 0;

      // Rule for isVirtual Services (less than 3 hour to startBooking)
      if (goingbooking.serviceType == "isChat") {
        let cancelbooking;
        // baseServiceFee not more than $100
        if (diffInHours < 3) {
          cancelCharges = 10;
          console.log("cancelCharges", cancelCharges);
          //proBooking update
          cancelbooking = await updateDocument(
            "proBookingService",
            { _id: id },
            {
              $inc: { CancelCharges: cancelCharges },
              status: "Cancelled",
              cancelledReason: "Cancelled By Professional",
              CancelDate,
              CancelTime,
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
              $inc: { CancelCharges: cancelCharges },
            }
          );
          // pro TotalCharges update
          const proTotalCharges = await updateDocument(
            "user",
            { _id: goingbooking.professsionalId },
            {
              $inc: { chargesAmount: cancelCharges },
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
    


  } catch (e) {
    console.log(e);
    return res.status(400).json({ status: 400, message: e.message });
  }
};

export default cancelledBooking;
