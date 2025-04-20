import express from "express";

import addFaqQuestion from "./add.js";
import getFaqQuestion from "./get.js";
import updateFaqQuestion from "./update.js";
import hideFaqQuestion from "./hide.js";
import getFaqSingleQuestion from "./getSingle.js";

const router = express.Router();

//----Add FAQ Question--------//
router.post("/add", addFaqQuestion);


//----Get FAQ Question--------//
router.get("/get", getFaqQuestion);

//----Get Single FAQ Question--------//
router.get("/:id", getFaqSingleQuestion)

//----Hide Single FAQ Question--------//
router.put("/hide/:id", hideFaqQuestion);

//----Update FAQ Question--------//
router.put("/:id", updateFaqQuestion);

export default router;
