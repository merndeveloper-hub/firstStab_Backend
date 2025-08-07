import Joi from "joi";
import { findOne, updateDocument } from "../../../helpers/index.js";

const schema = Joi.object().keys({
  id: Joi.string().required(),
});

const priceQuoteBooking = async (req, res) => {
  try {
    await schema.validateAsync(req.params);
    const { id } = req.params;
    const { quoteAmount } = req.body;
    const goingbooking = await findOne("proBookingService", { _id: id });

    if (!goingbooking || goingbooking.length == 0) {
      return res
        .status(400)
        .json({ status: 400, message: "No Booking Found!" });
    }

    const quoteBooking = await updateDocument(
      "proBookingService",
      { _id: id },
      { quoteAmount: quoteAmount }
    );

    if (!quoteBooking || quoteBooking.length == 0) {
      return res
        .status(400)
        .json({ status: 400, message: "No Booking Found!" });
    }

    const cancelRandomProBooking = await updateDocument(
      "userBookServ",
      {
        _id: goingbooking?.bookServiceId,
      },
      { quoteAmount: quoteAmount }
    );

    return res.status(200).json({
      status: 200,
      message: "quote Booking By Professional",
      quoteBooking,
    });
  } catch (e) {
    console.log(e);
    return res.status(400).json({ status: 400, message: e.message });
  }
};

export default priceQuoteBooking;
