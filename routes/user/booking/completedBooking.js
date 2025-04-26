import Joi from "joi";
import {
  findOne,
  updateDocument,
} from "../../../helpers/index.js";

const schema = Joi.object().keys({
  id: Joi.string().required(),
});




//serviceImage
const completedBooking = async (req, res) => {
  try {
   
    
    await schema.validateAsync(req.params);
   
    const { id } = req.params;
    const deliveredUserBooking = await findOne("userBookServ", { _id: id });

    if (!deliveredUserBooking || deliveredUserBooking.length == 0) {
      return res
        .status(400)
        .json({ status: 400, message: "No Booking Found!" });
    }



 

    const deliveredBooking = await updateDocument(
      "userBookServ",
      { _id: id,status:"Delivered" },
      { status: "Completed"  }
    );

    
    if (!deliveredBooking || deliveredBooking.length == 0) {
      return res
      .status(400)
      .json({ status: 400, message: "No Booking Found!" });
    }
    
    const deliveredRandomProBooking = await updateDocument(
      "proBookingService",
      { bookServiceId: id,status:"Delivered"},
      { status: "Completed"  }
    );
    
    return res
      .status(200)
      .json({
        status: 200,
        message: "Delivered Service By Professional",
        deliveredBooking,
      });
  } catch (e) {
    console.log(e);
    return res.status(400).json({ status: 400, message: e.message });
  }
};

export default completedBooking;




