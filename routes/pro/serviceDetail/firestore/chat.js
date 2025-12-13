import { findOne, insertNewDocument } from "../../../../helpers/index.js";

const sendChat = async (req, res) => {

  try {
    const { userId1, userId2 } = req.body;
    let chat = await findOne('chat', { participants: { $all: [userId1, userId2] } })
    if (!chat) {
      chat = await insertNewDocument('chat', { participants: [userId1, userId2] })

    }
    res.json(chat);
    return res.status(200).json({ success: true, message: "Message sent successfully!" });
  } catch (error) {

    console.error("Send Message Error:", error);
    return res.status(400).json({ error: error.message });
  }

};

export default sendChat;
