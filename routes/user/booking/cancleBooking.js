import Joi from "joi";
import {
  findOne,
  updateDocument,
} from "../../../helpers/index.js";

const schema = Joi.object().keys({
  id: Joi.string().required(),
});

const cancelledBooking = async (req, res) => {
  try {
    await schema.validateAsync(req.params);
    const { id } = req.params;
    const goingbooking = await findOne("userBookServ", { _id: id });

    if (!goingbooking || goingbooking.length == 0) {
      return res
        .status(400)
        .json({ status: 400, message: "No Booking Found!" });
    }

    const cancelbooking = await updateDocument(
      "userBookServ",
      { _id: id },
      { status: "Cancelled", cancelledReason: "Cancelled By User" }
    );

    
    if (!cancelbooking) {
      return res
      .status(400)
      .json({ status: 400, message: "No Booking Found!" });
    }
    
    const cancelRandomProBooking = await updateDocument(
      "proBookingService",
      { bookServiceId: id,status:{$in:["Accepted","Pending"]}},
      { status: "Cancelled", cancelledReason: "Cancelled By User" }
    );
    
    return res
      .status(200)
      .json({
        status: 200,
        message: "Cancelled Booking By User",
        cancelbooking,
      });
  } catch (e) {
   
    return res.status(400).json({ status: 400, message: e.message });
  }
};

export default cancelledBooking;
