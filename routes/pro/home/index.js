import express from "express";


import getAllCategoriesWithSubcate from "./getAdminMainSubCategory.js";
import getCategories from "./getAdminCategorie.js";
import getSubCateWithPagination from "./getSubCategoriePagination.js";

//------Add Media Image and Icon in categorie---//

import getServiceCategoryCount from "./getServiceCount.js";
import createService from "./addService.js";
import updateService from "./updateService.js";
import updateServiceType from "./updateServiceType.js";
import getSelectedServiceCategory from "./selectedSubcategorie.js";
import removeServiceSubCategory from "./removeServiceSubCategory.js";

import multipart from "connect-multiparty";
import removeServiceCategory from "./removeServiceCategory.js";
import tokenVerification from "../../../middleware/token-verification/index.js";
const multipartMiddleware = multipart();

const router = express.Router();

//router.get("/list", getAllCategories);

//--------Get All Admin Categories With subcategories---//
router.get("/subcategory",tokenVerification,getAllCategoriesWithSubcate)

//--------Get All Admin Categories on pro screen-------//
router.get("/:id",tokenVerification,getCategories)


//--------Get Single Admin Category With subcategories Pagination---//
router.get("/subcategory/:id",tokenVerification, getSubCateWithPagination);


//--------Count Pro Service ---//
router.get("/servicecount/:id",tokenVerification,getServiceCategoryCount);


//--------Create Service With Categories and subcategories---//
router.post("/",tokenVerification, createService);

//--------update Service With Categories and subcategories and businessname---//
 router.put("/",tokenVerification,updateService);

//-----Delete pro created sub category service----//
router.delete("/subcategory/:id",tokenVerification, removeServiceSubCategory);

//-----Delete pro created sub category service----//
router.delete("/category/:id",tokenVerification, removeServiceCategory);

//--------update Service Type With Categories and subcategories and businessname---//
 router.put("/:id",tokenVerification,updateServiceType);


//--------get seleted Service With Categories and subcategories and businessname---//
 router.get("/selected/:id",tokenVerification,getSelectedServiceCategory);


export default router;
