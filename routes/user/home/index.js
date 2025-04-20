import express from "express";

import bookService from "./bookService.js"

import getProfessionalService from "./getProfessionalService.js";
import getAllCategoriesWithSubcate from "../../pro/home/getAdminMainSubCategory.js";
import getCategories from "./getAdminCategorie.js";
import getSubCateWithPagination from "../../pro/home/getSubCategoriePagination.js";
import mostPopularCategory from "./mostPopularCategory.js";


import multipart from "connect-multiparty";

const multipartMiddleware = multipart();

const router = express.Router();


//----------Get Pro whose give service in this category and subcategory----//
router.get("/getproservice",getProfessionalService);

 //router.put("/:id",multipartMiddleware, updateCategory);
 //router.delete("/:id", deleteCategory);
// Get Single Blog
//router.get("/single/:id", getSingleCategory);


//Book Service
router.post("/bookservice",multipartMiddleware, bookService)


//--------Get All Admin Categories With subcategories---//
router.get("/subcategory",getAllCategoriesWithSubcate)

//--------Get All Admin Categories-------//
router.get("/",getCategories)

//--------Get Single Admin Category With subcategories Pagination---//
router.get("/subcategory/:id", getSubCateWithPagination);




//--------Get Single Admin Category With subcategories Pagination---//
router.get("/mostpopular", mostPopularCategory);

export default router;
