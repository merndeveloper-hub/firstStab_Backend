import express from "express";
import verifyToken from "./verify-token.js";

const router = express.Router();

//---Token verfiy
router.post("/verify", verifyToken);

export default router;
