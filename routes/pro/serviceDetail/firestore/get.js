
import {  findAndSort } from "../../../../helpers/index.js";

const getChatMessages = async (req, res) => {
  try {


    const messages = await findAndSort('chatMessage', { chatId: req.params.chatId }, { timestamp: 1 })
    return res.status(200).json({ status: 200, data: messages });



  } catch (error) {
    console.error("Get Chat Messages Error:", error);
    return res.status(400).json({ error: error.message });
  }
};

export default getChatMessages;
