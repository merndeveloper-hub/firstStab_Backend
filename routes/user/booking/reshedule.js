import Joi from "joi";
import { findOne, updateDocument } from "../../../helpers/index.js";

// const schema = Joi.object().keys({
//   id: Joi.string().required(),
// });

const schemaBody = Joi.object().keys({
  userId: Joi.string().allow("").optional(),
  professsionalId: Joi.string().allow("").optional(),
  bookServiceId: Joi.string(),
  orderRescheduleStartTime: Joi.string(),
  serviceType: Joi.string().allow("").optional(),
  orderRescheduleStartDate: Joi.string(),
  orderRescheduleEndDate: Joi.string().allow("").optional(),
  orderRescheduleEndTime: Joi.string().allow("").optional(),
});

//Rejected
const userResheduleRequest = async (req, res) => {
  try {
    await schemaBody.validateAsync(req.body);

    const {
      bookServiceId,
      userId,
      professsionalId,
      serviceType,
      orderRescheduleStatus,
      orderRescheduleStartTime,
      orderRescheduleStartDate,
      orderExtendStatus,
      orderRescheduleEndDate,
      orderRescheduleRequest,
      orderRescheduleEndTime,
    } = req.body;

    const userBooking = await findOne("userBookServ", {
      _id: bookServiceId,
    });


    if (!userBooking || userBooking.length == 0) {
      return res.status(400).json({
        status: 400,
        message: "Booking Not Found",
      });
    }
  
    const proBooking = await findOne("proBookingService", {
      bookServiceId,
    });
    if (!proBooking || proBooking.length == 0) {
      return res.status(400).json({
        status: 400,
        message: "Booking Not Found",
      });
    }
 
    const findUserBooking = await findOne("userBookServ", {
      _id: bookServiceId,
      status: "Completed",
    });

    if (findUserBooking) {
      return res.status(400).json({
        status: 400,
        message: "Booking already completed",
      });
    }

    const findProBooking = await findOne("proBookingService", {
      bookServiceId,
      status: "Completed",
    });
    if (findProBooking) {
      return res.status(400).json({
        status: 400,
        message: "Booking already completed",
      });
    }
  
    const findResheduleProBooking = await findOne("proBookingService", {
      bookServiceId,
      status: "Requested",
      orderRescheduleStatus: "Requested",
      orderRescheduleRequest: "professional",
    });
    const findResheduleUserBooking = await findOne("userBookServ", {
      _id: bookServiceId,
      status: "Requested",
      orderRescheduleStatus: "Requested",
      orderRescheduleRequest: "professional",
    });
    
    if (findResheduleProBooking && findResheduleUserBooking) {
      return res.status(400).json({
        status: 400,
        message: "Professional already requested reshedule booking",
      });
    }
  
    const findBooking = await findOne("userBookServ", {
      _id: bookServiceId,
      status: "Accepted",
    });
    const findproBooking = await findOne("proBookingService", {
      bookServiceId,
      status: "Accepted",
    });

    if (findBooking && findproBooking) {
      const getProBookService = await updateDocument(
        "proBookingService",
        { bookServiceId, status: "Accepted" },
        {
          status: "Requested",
          orderRescheduleStatus: "Requested",
          orderRescheduleRequest: "user",
          ...req.body,
        }
      );

      const userBookServiceUpdate = await updateDocument(
        "userBookServ",
        { _id: bookServiceId, status: "Accepted" },
        {
          status: "Requested",
          orderRescheduleStatus: "Requested",
          orderRescheduleRequest: "user",
          ...req.body,
        }
      );

      return res.status(200).json({
        status: 200,
        data: { getProBookService, userBookServiceUpdate },
        message: "User requested reshdule booking",
      });
    }


    if (!findBooking && !findproBooking) {
      return res.status(400).json({
        status: 400,
        message: "Booking Not Found",
      });
    }


  } catch (e) {
    console.log(e);
    return res.status(400).json({ status: 400, message: e.message });
  }
};

export default userResheduleRequest;
