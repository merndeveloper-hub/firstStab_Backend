import { find } from "../../../../helpers/index.js";

const getChatMessages = async (req, res) => {
  try {


    const { senderId, receiverId, proBooking } = req.params
    console.log(req.params);
let messages;
    if (proBooking) {
      messages = await find(
        'chatMessage',
        {
          $or: [
            { senderId, receiverId },
            { senderId: receiverId, receiverId: senderId }
          ],
          proBooking
        }
      );
    } else {
      messages = await find(
        'chatMessage',
        {
          $or: [
            { senderId, receiverId },
            { senderId: receiverId, receiverId: senderId }
          ]

        }
      );
    }

    return res.status(200).json({ status: 200, data: messages });

  } catch (error) {
    console.error("Get Chat Messages Error:", error);
    return res.status(400).json({ error: error.message });
  }
};

export default getChatMessages;
