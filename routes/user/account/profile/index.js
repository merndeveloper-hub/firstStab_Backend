import express from "express";
//import addCategory from "./add-category.js";


import updateProfile from "./update.js";
import findUser from "./get.js";

import multipart from "connect-multiparty";
const multipartMiddleware = multipart();

const router = express.Router();

// router.put(
//   "/update/:id",multipartMiddleware,
//   updateProfile
// );

// router.get("/", getAddress);
// router.post("/add",addAddress);
 router.put("/update/:id",multipartMiddleware,updateProfile);
//router.delete("/:id", deleteAddress);
// Get Single Blog
router.get("/:id", findUser);

export default router;
