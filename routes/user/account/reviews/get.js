import Joi from "joi";
//import { findOne, updateDocument } from "../../../helpers/index.js";
import { insertNewDocument,findOne, updateDocument } from "../../../../helpers/index.js";

const schemaBody = Joi.object().keys({
  userId: Joi.string().required(),
  professsionalId: Joi.string().required(),
  proServiceId: Joi.string(),
  bookServiceId: Joi.string().required(),
  serviceType: Joi.string(),
  commit: Joi.string().allow("").optional(),
  reviewStar: Joi.number().required(),
});

const reviewService = async (req, res) => {
  try {
    await schemaBody.validateAsync(req.body);
    const {
      userId,
      professsionalId,
      proServiceId,
      bookServiceId,
      serviceType,
      commit,
      reviewStar,
    } = req.body;

    const findUser = await findOne("user", { _id: userId });
    if (!findUser || findUser.length == 0) {
      return res.status(400).json({
        status: 400,
        message: "No User found!",
      });
    }

    const findProfessional = await findOne("user", { _id: professsionalId });
    if (!findProfessional || findProfessional.length == 0) {
      return res.status(400).json({
        status: 400,
        message: "No Professional found!",
      });
    }

    const findProBooking = await findOne("proBookingService", {
      proServiceId: proServiceId,
      status: "Completed",
    });

    if (!findProBooking || findProBooking.length == 0) {
      return res.status(400).json({
        status: 400,
        message: "No Booking found!",
      });
    }

    const findUserBooking = await findOne("userBookServ", {
      _id: bookServiceId,
      status: "Completed",
    });

    if (!findUserBooking || findUserBooking.length == 0) {
      return res.status(400).json({
        status: 400,
        message: "No Booking found!",
      });
    }

    const review = await insertNewDocument("review", { ...req.body });

    return res.status(200).json({
      status: 200,
      message: "User gives reviews to professional",
      data: { review },
    });
  } catch (e) {
    console.log(e);
    return res.status(400).json({ status: 400, message: e.message });
  }
};

export default reviewService;
