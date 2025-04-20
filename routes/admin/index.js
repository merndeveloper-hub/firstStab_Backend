import express from "express";
import category from "./category/index.js";
import subCategory from "./subCategory/index.js";
import subSubCategory from './subSubCategory/index.js'
import contentPage from "./contentPages/index.js";
import faqCategory from "./faqCategorie/index.js";
import faqQuestion from "./faqQuestion/index.js";


const router = express.Router();

// const user = require("./user");
// const profile = require("./profile");
// const nft = require("./nft");
// const blog = require("./blog");
// const roles = require("./roles");
// const allowlist = require("./allowlist");
// const  launchpad  = require("./launchpad");

// router.use("/user", user);
// router.use("/nft", nft);
// router.use("/profile", profile);
// router.use("/blog", blog);
 router.use("/faqQuestion", faqQuestion);
router.use("/faqCategory", faqCategory);
router.use("/contentPage", contentPage);

//-----------Admin Add Main Category---------------//
router.use("/category",category)

//-----------Admin Add Sub Category---------------//
router.use("/subcategory",subCategory)

//-----------Admin Add Sub-sub Category---------------//
router.use("/subsubcategory",subSubCategory)

export default router;
