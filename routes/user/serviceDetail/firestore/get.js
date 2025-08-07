
//import firebaseConfig from "../../../../config/firebase/firebaseConfig.js";

import { find, findAndSort } from "../../../../helpers/index.js";

const getChatMessages = async (req, res) => {
  try {
//     const { clientId, proId, limit = 30, lastVisibleTimestamp } = req.params;

//     // Get all chats for a user
// router.get('/user/:userId', async (req, res) => {
//   const chats = await Chat.find({ participants: req.params.userId })
//     .populate('lastMessage')
//     .populate('participants');
//   res.json(chats);
// });

// // Get all messages for a chat
// router.get('/:chatId', async (req, res) => {
//   const messages = await Message.find({ chatId: req.params.chatId }).sort('timestamp');
//   res.json(messages);
// });
const {senderId,receiverId} = req.params
console.log(req.params);

const messages = await find('chatMessage',{senderId,receiverId})
return res.status(200).json({ status:200, data:messages });

    // if (!clientId || !proId) {
    //   return res.status(400).json({ error: "clientId and proId are required." });
    // }

    // const chatId = `${proId}_${clientId}`;

    // let queryRef = firebaseConfig.db
    //   .collection("chats")
    //   .doc(chatId)
    //   .collection("messages")
    //   .orderBy("createdAt", "desc")
    //   .limit(Number(limit));

    // if (lastVisibleTimestamp) {
    //   const parsedTimestamp = new Date(lastVisibleTimestamp);
    //   queryRef = queryRef.startAfter(parsedTimestamp);
    // }

    // const snapshot = await queryRef.get();

    // const messages = snapshot.docs.map(doc => ({
    //   id: doc.id,
    //   ...doc.data()
    // }));

    // return res.status(200).json({
    //   success: true,
    //   messages,
    //  lastVisible: messages.length > 0 ? messages[messages.length - 1].createdAt : null
    // });

  } catch (error) {
    console.error("Get Chat Messages Error:", error);
    return res.status(400).json({ error: error.message });
  }
};

export default getChatMessages;
