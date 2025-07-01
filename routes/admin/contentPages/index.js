import express from "express";

import addContentPage from "./add.js";
import getContentPage from "./get.js";
import updateContentPage from "./update.js";
import hidePage from "./hide.js";
import singleContentPage from "./getSingle.js";

//-------Media image add---//
import multipart from "connect-multiparty";
const multipartMiddleware = multipart();

const router = express.Router();

//------Add Page--------//
router.post("/add",multipartMiddleware, addContentPage);

//------Update Page--------//
router.put("/:id",multipartMiddleware, updateContentPage);

//------Get All Pages--------//
router.get("/", getContentPage);

//------Get Single Page--------//
router.get("/:id", singleContentPage)

//------Hide Single Page--------//
router.put("/hide/:id", hidePage);


export default router;
