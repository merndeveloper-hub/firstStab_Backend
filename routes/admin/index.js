import express from "express";
import category from "./category/index.js";
import subCategory from "./subCategory/index.js";
import user from './user/index.js'
import pro from './pro/index.js'
import contentPage from "./contentPages/index.js";
import faqCategory from "./faqCategorie/index.js";
import faqQuestion from "./faqQuestion/index.js";
import adminLogs from "./adminLogs/index.js";
import adminCharges from "./adminFees/index.js";

const router = express.Router();



//-----Admin Create FAQ Category Question--------//
 router.use("/faqQuestion", faqQuestion);

//-----Admin Create FAQ Category--------//
router.use("/faqCategory", faqCategory);

//-----Admin Create Page--------//
router.use("/contentPage", contentPage);

//-----------Admin Add Main Category---------------//
router.use("/category",category)

//-----------Admin Add Sub Category---------------//
router.use("/subcategory",subCategory)

//-----------Admin User ---------------//
router.use("/user",user)

//-----------Admin Pro---------------//
router.use("/pro",pro)


//-----------apps Logs---------------//
router.use("/logs",adminLogs)

//-----------apps Logs---------------//
router.use("/charges",adminCharges)

export default router;
