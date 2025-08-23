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
import certificate  from "./certificate/index.js";
import booking  from "./booking/index.js";

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

//-----------Admin Booking---------------//
router.use("/booking",booking)

//-----------Admin Pro Certificate---------------//
router.use("/certificate",certificate)


//-----------apps Logs---------------//
router.use("/logs",adminLogs)

//-----------apps Logs---------------//
router.use("/charges",adminCharges)

export default router;
