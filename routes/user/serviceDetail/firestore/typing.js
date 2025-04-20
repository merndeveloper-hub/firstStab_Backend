// // Typing Indicator router.post("/typing", async (req, res) => { const { chatId, userId, isTyping } = req.body;

// try { await db.collection("chats").doc(chatId).update({ [typing.${userId}]: isTyping, });
// res.json({ success: true });
// } catch (err) { res.status(500).json({ error: err.message }); } });