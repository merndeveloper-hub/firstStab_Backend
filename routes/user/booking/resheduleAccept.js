import Joi from "joi";
import { findOne, updateDocument } from "../../../helpers/index.js";

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
const resheduleAcceptBooking = async (req, res) => {
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
      orderRescheduleEndDate,
      orderExtendStatus,
      orderRescheduleEndTime,
      orderRescheduleRequest,
    } = req.body;

    const findProResheduleService = await findOne(
      "proBookingService",

      {
        bookServiceId,
        status: "Requested",
        orderRescheduleStatus: "Requested",
        orderRescheduleRequest: "user",
      }
    );

    const findUserResheduleService = await findOne("userBookServ", {
      _id: bookServiceId,
      status: "Requested",
      orderRescheduleStatus: "Requested",
      orderRescheduleRequest: "user",
    });

    if (findProResheduleService && findUserResheduleService) {
      return res.json({
        status: 400,
        message: "User has not requested to reshedule meeting",
      });
    }

    const acceptProResheduleService = await findOne(
      "proBookingService",

      {
        bookServiceId,
        status: "Accepted",
        orderRescheduleStatus: "Accepted",
        orderRescheduleRequest: "professional",
      }
    );

    const acceptUserResheduleService = await findOne("userBookServ", {
      _id: bookServiceId,
      status: "Accepted",
      orderRescheduleStatus: "Accepted",
      orderRescheduleRequest: "professional",
    });

    if (acceptProResheduleService && acceptUserResheduleService) {
      return res.json({
        status: 400,
        message: "User has already requested to reshedule meeting",
      });
    }

    const findResheduleService = await findOne(
      "proBookingService",

      {
        bookServiceId,
        status: "Requested",
        orderRescheduleStatus: "Requested",
      }
    );

    const findResheduleProService = await findOne("userBookServ", {
      _id: bookServiceId,
      status: "Requested",
      orderRescheduleStatus: "Requested",
    });
    if (!findResheduleService && !findResheduleProService) {
      return res.json({
        status: 400,
        message: "No Reshedule Booking Found",
      });
    }

    const updateProResheduleService = await updateDocument(
      "proBookingService",

      {
        bookServiceId,
        status: "Requested",
        orderRescheduleStatus: "Requested",
        orderRescheduleRequest: "professional",
      },
      {
        status: "Accepted",
        orderRescheduleStatus: "Accepted",
        orderStartTime: orderRescheduleStartTime,
        orderStartDate: orderRescheduleStartDate,
        orderEndDate: orderRescheduleEndDate
          ? orderRescheduleEndDate
          : undefined,
          orderEndTime: orderRescheduleEndTime ? orderRescheduleEndTime : undefined,
        ...req.body,
      }
    );

    let subCategories = {
      orderStartTime: orderRescheduleStartTime,
      orderStartDate: orderRescheduleStartDate,
      orderEndDate: orderRescheduleEndDate ? orderRescheduleEndDate : undefined,
      orderEndTime: orderRescheduleEndTime ? orderRescheduleEndTime : undefined,
    };
    const userBookServiceReshedule = await updateDocument(
      "userBookServ",

      {
        _id: bookServiceId,
        status: "Requested",
        orderRescheduleStatus: "Requested",
        orderRescheduleRequest: "professional",
      },
      {
        status: "Accepted",
        orderRescheduleStatus: "Accepted",
        subCategories,
        ...req.body,
      }
    );

    return res.json({
      status: 200,
      message: "User has accepted reshedule meeting",
    });
  } catch (e) {
    return res.status(400).json({ status: 400, message: e.message });
  }
};

export default resheduleAcceptBooking;
