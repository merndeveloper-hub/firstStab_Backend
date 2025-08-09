import Joi from "joi";
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

    const cancelbooking = await updateDocument(
      "proBookingService",
      { _id: id },
      {
        status: "Cancelled",
        cancelledReason: "Cancelled By Professional",
        CancelDate,
        CancelTime,
      }
    );

    if (!cancelbooking || cancelbooking.length == 0) {
      return res
        .status(400)
        .json({ status: 400, message: "No Booking Found!" });
    }

    console.log();

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
      }
    );

    console.log(cancelRandomProBooking, "can");

    return res.status(200).json({
      status: 200,
      message: "Cancelled Booking By Professional",
      cancelbooking,
    });
  } catch (e) {
    console.log(e);
    return res.status(400).json({ status: 400, message: e.message });
  }
};

export default cancelledBooking;
