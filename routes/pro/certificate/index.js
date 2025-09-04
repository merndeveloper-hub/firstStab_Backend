import express from "express";


import addCertificate from "./add.js";
// import updateSubCategory from "./update.js";
// import getSubCategories from "./get.js";
import getSingleProCertificate from "./getSingle.js";
// import hideSubCategory from "./hide.js";

//-----Media upload icon and image -------/
import multipart from "connect-multiparty";
import temporaryCertificate from "./temporaryCertificate.js";
import tokenVerification from "../../../middleware/token-verification/index.js";
const multipartMiddleware = multipart();

const router = express.Router();


// //-------------Get All Main Category--------------//
// router.get("/allcategory", getMainCategories);

//-------------Add Certificate Pro--------------//
router.put("/:id",tokenVerification,multipartMiddleware, addCertificate);

// //-------------Update Sub Category--------------//
 router.put("/temp/:id",tokenVerification,multipartMiddleware, temporaryCertificate);





// //-------------Get Pro Service Certificate--------------//
 router.get("/:id",tokenVerification, getSingleProCertificate);

// //-------------Hide Single Sub Category--------------//
// router.put("/hide/:id", hideSubCategory);



export default router;
