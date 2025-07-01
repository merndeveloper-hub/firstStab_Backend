import express from "express";
//import addCategory from "./add-category.js";

import addAddress from "./add.js";
import updateAddress from "./update.js";
import deleteAddress from "./delete.js";
import getAddress from "./get.js";
import getSingleUserAddress from "./getSingle.js";
//import deleteCategory from "./delete-blog.js";
//import updateCategory from "./update-blog.js";



const router = express.Router();

//--------- Get User Created Address for IsInPerson Service need----/
router.get("/all/:id", getAddress);

//---------User Created Address for IsInPerson Service need----/
router.post("/",addAddress);

//---------update Get User Created Address for IsInPerson Service need----/
router.put("/:id",updateAddress);

//---------delete Get User Created Address for IsInPerson Service need----/
router.delete("/:id", deleteAddress);


//---------Single Get User Created Address for IsInPerson Service need----/
router.get("/:id", getSingleUserAddress);

export default router;
