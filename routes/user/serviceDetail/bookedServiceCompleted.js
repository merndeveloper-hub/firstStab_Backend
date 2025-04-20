import Joi from "joi";
import { findOne, updateDocument } from "../../../helpers/index.js";

const schema = Joi.object().keys({
  id: Joi.string().required(),
});

const schemaBody = Joi.object().keys({
  userId: Joi.string().required(),
  proServiceId: Joi.string(),
  bookServiceId: Joi.string().required(),
  userAccpetBookingId: Joi.string(),
  serviceType: Joi.string(),
  orderStatusRemarks: Joi.string().allow("").optional(),
  orderCancelRemarks: Joi.string().allow("").optional(),
  reason: Joi.string().allow("").optional(),
});

const completedBookedService = async (req, res) => {
  try {
    await schema.validateAsync(req.params);
    await schemaBody.validateAsync(req.body);
    const { orderStatusRemarks, orderCancelRemarks, reason, bookServiceId } =
      req.body;
    const { id } = req.params;
    const goingbooking = await findOne("serviceDetail", {
      _id: id,
      status: "Booked",
    });

    if (!goingbooking || goingbooking.length == 0) {
      return res
        .status(400)
        .json({ status: 400, message: "No Booking Found!" });
    }

    const completedbooking = await updateDocument(
      "serviceDetail",
      { _id: id },
      { status: "Completed By User", ...req.body }
    );

    const completedProBooking = await updateDocument(
      "proBookingService",
      {
        bookServiceId,
        status: "Accepted" || "Pending",
      },
      { status: "Completed" }
    );

    const completedUserBooking = await updateDocument(
      "userBookServ",
      {
        _id: bookServiceId,
        status: "Accepted" || "Pending",
      },
      { status: "Completed" }
    );

    return res.status(200).json({
      status: 200,
      message: "Completed Booking By User",
      cancelbooking,
    });
  } catch (e) {
    console.log(e);
    return res.status(400).json({ status: 400, message: e.message });
  }
};

export default completedBookedService;
