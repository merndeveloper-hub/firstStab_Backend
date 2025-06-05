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
const multipartMiddleware = multipart();

const router = express.Router();

//router.get("/list", getAllCategories);

//--------Get All Admin Categories With subcategories---//
router.get("/subcategory",getAllCategoriesWithSubcate)

//--------Get All Admin Categories on pro screen-------//
router.get("/:id",getCategories)


//--------Get Single Admin Category With subcategories Pagination---//
router.get("/subcategory/:id", getSubCateWithPagination);


//--------Count Pro Service ---//
router.get("/servicecount/:id",getServiceCategoryCount);


//--------Create Service With Categories and subcategories---//
router.post("/", createService);

//--------update Service With Categories and subcategories and businessname---//
 router.put("/",updateService);

//-----Delete pro created sub category service----//
router.delete("/subcategory/:id", removeServiceSubCategory);

//-----Delete pro created sub category service----//
router.delete("/category/:id", removeServiceCategory);

//--------update Service Type With Categories and subcategories and businessname---//
 router.put("/:id",updateServiceType);


//--------get seleted Service With Categories and subcategories and businessname---//
 router.get("/selected/:id",getSelectedServiceCategory);


export default router;
