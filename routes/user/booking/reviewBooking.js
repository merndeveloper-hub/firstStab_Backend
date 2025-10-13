import Joi from "joi";
import { findOne, updateDocument } from "../../../helpers/index.js";

const schema = Joi.object().keys({
  id: Joi.string().required(),
});

const reviewBooking = async (req, res) => {
  try {
    await schema.validateAsync(req.params);

    const { id } = req.params;

    const goingbooking = await findOne("userBookServ", { _id: id });

    if (!goingbooking || goingbooking.length == 0) {
      return res
        .status(400)
        .json({ status: 400, message: "No Booking Found!" });
    }

    const reviewedbooking = await updateDocument(
      "userBookServ",
      { _id: id },
      { status: "Confirmed" }
    );

    if (!reviewedbooking) {
      return res
        .status(400)
        .json({ status: 400, message: "No Booking Found!" });
    }

    const reviewRandomProBooking = await updateDocument(
      "proBookingService",
      { bookServiceId: id, status: { $in: ["Accepted", "Pending","Delivered"] } },
      { status: "Confirmed", review: "Yes" }
    );

    return res.status(200).json({
      status: 200,
      message: "Review Request By User",
      reviewedbooking,
    });
  } catch (e) {
    return res.status(400).json({ status: 400, message: e.message });
  }
};

export default reviewBooking;
