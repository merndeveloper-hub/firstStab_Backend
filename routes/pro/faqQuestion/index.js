import express from "express";

import getFaqQuestion from "./get.js";


const router = express.Router();


router.get("/get", getFaqQuestion);


export default router;
