import express from "express";

import getAllCategories from "./get-AllCategories.js";
import getSingleCategory from "./get-single-blog.js";


import multipart from "connect-multiparty";
import tokenVerification from "../../../middleware/token-verification/index.js";
const multipartMiddleware = multipart();

const router = express.Router();

router.get("/", tokenVerification, getAllCategories);

router.get("/single/:id", tokenVerification, getSingleCategory);

export default router;
