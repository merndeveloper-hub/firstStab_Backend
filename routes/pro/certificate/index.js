import express from "express";


import addCertificate from "./add.js";
// import updateSubCategory from "./update.js";
// import getSubCategories from "./get.js";
import getSingleProCertificate from "./getSingle.js";
// import hideSubCategory from "./hide.js";

//-----Media upload icon and image -------/
import multipart from "connect-multiparty";
const multipartMiddleware = multipart();

const router = express.Router();


// //-------------Get All Main Category--------------//
// router.get("/allcategory", getMainCategories);

//-------------Add Certificate Pro--------------//
router.put("/",multipartMiddleware, addCertificate);

// //-------------Update Sub Category--------------//
// router.put("/:id",multipartMiddleware, updateSubCategory);


// //-------------Get All Sub Category--------------//
// router.get("/", getSubCategories);


// //-------------Get Pro Service Certificate--------------//
 router.get("/:id", getSingleProCertificate);

// //-------------Hide Single Sub Category--------------//
// router.put("/hide/:id", hideSubCategory);



export default router;
