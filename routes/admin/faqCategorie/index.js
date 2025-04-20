import express from "express";
import addfaqCategorie from "./add.js";
import hideFaqCaetgory from "./hide.js";
import singleFaqCategory from "./getSingle.js";
import updatefaqCategory from "./update.js";
import getFaqCategory from "./get.js";

const router = express.Router();

//-----Add FAQ Category----///
router.post("/add", addfaqCategorie);

//-----Get All FAQ Category----///
router.get("/", getFaqCategory);

//-----Get Single FAQ Category----///
router.get("/get/:id", singleFaqCategory)

//-----Hide Single FAQ Category----///
router.put("/hide/:id", hideFaqCaetgory);

//-----update FAQ Category----///
router.put("/:id", updatefaqCategory);

export default router;
