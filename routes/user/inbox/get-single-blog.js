import Joi from "joi";
import { find } from "../../../helpers/index.js";

const schema = Joi.object().keys({
  senderId: Joi.string().required(),
  receiverId: Joi.string().required(),
});

const getBookingChat = async (req, res) => {
  try {
    await schema.validateAsync(req.body);

    const { senderId, receiverId } = req.body;

    const getChat = await find("chatMessage", {
      $or: [
        { senderId, receiverId },
        { senderId: receiverId, receiverId: senderId },
      ],
    });

    if (!getChat || getChat.length == 0) {
      return res.status(200).json({ status: 200, message: "No Messages" });
    }

    return res.status(200).json({ status: 200, getChat });
  } catch (e) {
    console.log(e);
    return res.status(400).json({ status: 400, message: e.message });
  }
};

export default getBookingChat;
