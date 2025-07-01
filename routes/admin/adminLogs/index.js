import express from "express";

import getLogs from "./getAllLogs.js";
import getApiLogs from "./get.js";


const router = express.Router();

//-------------Get All Main Category--------------//
router.get("/", getLogs);



//-------------Get Single Main Category--------------//
router.get("/all", getApiLogs);

export default router;
