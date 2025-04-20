import express from "express";

import address from "./address/index.js";
import profile from "./profile/index.js";
import payment from "./paymentMethod/index.js";



const router = express.Router();

//router.get("/", getAllCategories);
router.use("/address",address);
router.use("/profile", profile);
router.use("/payment", payment);
 //router.put("/:id",multipartMiddleware, updateCategory);
 //router.delete("/:id", deleteCategory);
// Get Single Blog
//router.get("/single/:id", getSingleCategory);

export default router;
