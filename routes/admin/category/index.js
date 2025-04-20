import express from "express";
import createCategory from "./add.js";
import getCategories from "./get.js";
import getSingleCategory from "./getSingle.js";
import hideCategory from "./hide.js";
import updateCategory from "./update.js";

// add image and icons
import multipart from "connect-multiparty";
const multipartMiddleware = multipart();

const router = express.Router();

//-------------Get All Main Category--------------//
router.get("/", getCategories);

//-------------Add Main Category--------------//
router.post("/add", multipartMiddleware, createCategory);

//-------------Update  Main Category--------------//
router.put("/:id", multipartMiddleware, updateCategory);

//-------------Hide Single Main Category--------------//
router.put("/hide/:id", hideCategory);

//-------------Get Single Main Category--------------//
router.get("/:id", getSingleCategory);

export default router;
