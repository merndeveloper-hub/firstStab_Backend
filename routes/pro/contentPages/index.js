import express from "express";

import getContentPage from "./get.js";


const router = express.Router();


router.get("/", getContentPage);


export default router;
