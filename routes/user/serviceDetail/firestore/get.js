import { find, findOne } from "../../../../helpers/index.js";

const getChatMessages = async (req, res) => {
  try {


    const { senderId, receiverId, proBooking } = req.params
 
    let checkMessageBooking = await findOne(
      'chatMessage',
      { proBooking }
    );


    let messages;
    if (checkMessageBooking) {
   

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
