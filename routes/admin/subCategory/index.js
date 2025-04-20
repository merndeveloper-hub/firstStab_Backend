import express from "express";


import addCategory from "./add.js";
import updateSubCategory from "./update.js";
import getSubCategories from "./get.js";
import getSingleSubCategory from "./getSingle.js";
import hideSubCategory from "./hide.js";

//-----Media upload icon and image -------/
import multipart from "connect-multiparty";
const multipartMiddleware = multipart();

const router = express.Router();

//-------------Add Sub Category--------------//
router.post("/add",multipartMiddleware, addCategory);

//-------------Update Sub Category--------------//
router.put("/:id",multipartMiddleware, updateSubCategory);


//-------------Get All Sub Category--------------//
router.get("/", getSubCategories);


//-------------Get Single Main Category--------------//
router.get("/:id", getSingleSubCategory);

//-------------Hide Single Sub Category--------------//
router.put("/hide/:id", hideSubCategory);
export default router;
