// // Update Last Seen router.post("/update-last-seen", async (req, res) => { const { userId } = req.body;

// try { await db.collection("users").doc(userId).set( { lastSeen: new Date(), }, { merge: true } );

// res.json({ success: true });
// } catch (err) { res.status(500).json({ error: err.message }); } });