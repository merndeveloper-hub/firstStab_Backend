import express from "express";

import addFaqQuestion from "./add.js";
import getFaqQuestion from "./get.js";
import updateFaqQuestion from "./update.js";
import hideFaqQuestion from "./hide.js";
import getFaqSingleQuestion from "./getSingle.js";
import getMainCategories from "./getMainFaqCategory.js";

const router = express.Router();



//-------------Get All Main Category--------------//
router.get("/allcategory", getMainCategories);

//----Add FAQ Question--------//
router.post("/add", addFaqQuestion);


//----Get FAQ Question--------//
router.get("/", getFaqQuestion);

//----Get Single FAQ Question--------//
router.get("/:id", getFaqSingleQuestion)

//----Hide Single FAQ Question--------//
router.put("/hide/:id", hideFaqQuestion);

//----Update FAQ Question--------//
router.put("/:id", updateFaqQuestion);

export default router;
