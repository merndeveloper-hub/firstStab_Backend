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

   

    // Pehle findOne use karo to get current reviewCount
    const findReviewProBooking = await findOne(
      "proBookingService",
      { bookServiceId: id }
    );

    if (!findReviewProBooking) {
      return res.status(400).json({ 
        status: 400, 
        message: "Professional Booking not found!" 
      });
    }

    // Current reviewCount ko safely handle karo (agar undefined hai to 0 use karo)
    const currentReviewCount = findReviewProBooking.reviewCount || 0;

    // Check if reviewCount is already 3 or more
    if (currentReviewCount >= 3) {
      return res.status(400).json({ 
        status: 400, 
        message: "You have reached the review limit (3 reviews maximum)" 
      });
    }

    // If reviewCount is less than 3, proceed with update
    const reviewRandomProBooking = await updateDocument(
      "proBookingService",
      { 
        bookServiceId: id, 
        status: { $in: ["Accepted", "Pending", "Delivered"] } 
      },
      { 
        status: "Confirmed", 
        review: "Yes",
        reviewCount: currentReviewCount + 1 
      }
    );
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
    if (!reviewRandomProBooking) {
      return res.status(400).json({ 
        status: 400, 
        message: "Failed to update professional booking" 
      });
    }

    return res.status(200).json({
      status: 200,
      message: "Review Request By User",
      reviewedbooking,
      reviewCount: currentReviewCount + 1
    });

  } catch (e) {
    return res.status(400).json({ status: 400, message: e.message });
  }
};

export default reviewBooking;