import Joi from "joi";
import {
  insertNewDocument,
  updateDocument,
  updateDocuments,
} from "../../../helpers/index.js";

const schema = Joi.object().keys({
  id: Joi.string().required(),
});

const schemaBody = Joi.object().keys({
  amount: Joi.string(),
  userId: Joi.string(),
  proServiceId: Joi.string(),
  professsionalId: Joi.string(),
  bookServiceId: Joi.string(),
  addInstruction: Joi.string(),
  userAccpetBookingId: Joi.string(),
  serviceType: Joi.string().required(),
});

//Rejected
const userAcceptProServiceRequest = async (req, res) => {
  try {
    await schema.validateAsync(req.params);
    await schemaBody.validateAsync(req.body);

    const { amount, userId, professsionalId, serviceType } = req.body;
    const { id } = req.params;

    const timestamp = Date.now(); // Current time in milliseconds (ensures uniqueness)
    const videoRoomName = `videoroom_user${userId.slice(
      0,
      4
    )}_pro${professsionalId.slice(0, 4)}_${timestamp}`;
    const chatChannelName = `chatroom_user${userId.slice(
      0,
      4
    )}_pro${professsionalId.slice(0, 4)}_${timestamp}`;
    if (serviceType == "isVirtual") {
      const getProBookService = await updateDocument(
        "proBookingService",
        { _id: id },
        { status: "Accepted", videoRoomName,orderRescheduleStatus:"Accepted" }
      );

      if (!getProBookService || getProBookService.length == 0) {
        return res.status(200).json({
          status: 200,
          message: "No professional quotes available at the moment.",
        });
      }

      const userBookServiceUpdate = await updateDocument(
        "userBookServ",
        { _id: getProBookService.bookServiceId },
        { status: "Accepted", videoRoomName, professionalId: professsionalId,orderRescheduleStatus:"Accepted"  }
      );

      const remainingProRejected = await updateDocuments(
        "proBookingService",
        { bookServiceId: getProBookService.bookServiceId, status: "Pending" },
        { status: "Rejected" }
      );

      //const getPaymentLink = await createPaypalOrder()

      return res.status(200).json({
        status: 200,
        getProBookService,
        message: "Updated Book Service successfully",
      });
    } else {
      const getProBookService = await updateDocument(
        "proBookingService",
        { _id: id },
        { status: "Accepted", chatChannelName,orderRescheduleStatus:"Accepted"  }
      );

      if (!getProBookService || getProBookService.length == 0) {
        return res.status(200).json({
          status: 200,
          message: "No professional quotes available at the moment.",
        });
      }

      const userBookServiceUpdate = await updateDocument(
        "userBookServ",
        { _id: getProBookService.bookServiceId },
        { status: "Accepted", chatChannelName, professionalId: professsionalId,orderRescheduleStatus:"Accepted"  }
      );

      const remainingProRejected = await updateDocuments(
        "proBookingService",
        { bookServiceId: getProBookService.bookServiceId, status: "Pending" },
        { status: "Rejected" }
      );

      //const getPaymentLink = await createPaypalOrder()

      return res.status(200).json({
        status: 200,
        getProBookService,
        message: "Updated Book Service successfully",
      });
    }
  } catch (e) {
    console.log(e);
    return res.status(400).json({ status: 400, message: e.message });
  }
};

export default userAcceptProServiceRequest;
