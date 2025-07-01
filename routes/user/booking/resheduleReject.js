import Joi from "joi";
import {
  findOne,
  updateDocument,
} from "../../../helpers/index.js";

const schema = Joi.object().keys({
  id: Joi.string().required(),
});

const cancelledRescheduleBooking = async (req, res) => {
  try {
    await schema.validateAsync(req.params);
    const { id } = req.params;
    const reshedulegoingbooking = await findOne("userBookServ", { _id: id });

    if (!reshedulegoingbooking || reshedulegoingbooking.length == 0) {
      return res
        .status(400)
        .json({ status: 400, message: "No Reshedule Booking Found!" });
    }

    const cancelbooking = await updateDocument(
      "userBookServ",
      { _id: id },
      { status: "Cancelled",orderRescheduleStatus:"Cancelled", cancelledReason: "Cancelled By User" }
    );

    
    if (!cancelbooking) {
      return res
      .status(400)
      .json({ status: 400, message: "No Reshedule Booking Found!" });
    }
    
    const cancelRandomProBooking = await updateDocument(
      "proBookingService",
      { bookServiceId: id},
      { status: "Cancelled",orderRescheduleStatus:"Cancelled", cancelledReason: "Cancelled By User" }
    );
    
    return res
      .status(200)
      .json({
        status: 200,
        message: "Cancelled Reshedule Booking By User",
        cancelbooking,
      });
  } catch (e) {
   
    return res.status(400).json({ status: 400, message: e.message });
  }
};

export default cancelledRescheduleBooking;
