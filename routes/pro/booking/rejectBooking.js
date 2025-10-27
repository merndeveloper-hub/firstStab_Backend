import Joi from "joi";

import { findOne, updateDocument } from "../../../helpers/index.js";

const schema = Joi.object().keys({
  id: Joi.string().required(),
});

const rejectBooking = async (req, res) => {
  try {
    await schema.validateAsync(req.params);

    const { id } = req.params;

    const getBooking = await findOne("proBookingService", { _id: id });

    if (!getBooking || getBooking.length == 0) {
      return res
        .status(400)
        .json({ status: 400, message: "No Booking Found!" });
    }

    let cancelbooking = await updateDocument(
      "proBookingService",
      { _id: id },
      {
        status: "Cancelled",
        cancelledReason: "Cancelled By Professional",
      }
    );
    // userBooking update
    const cancelRandomProBooking = await updateDocument(
      "userBookServ",
      {
        _id: getBooking?.bookServiceId,
      },
      {
        status: "Cancelled",
        cancelledReason: "Cancelled By Professional",
      }
    );
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

export default rejectBooking;
