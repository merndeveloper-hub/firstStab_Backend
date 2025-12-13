import express from "express";


import addAddress from "./add.js";
import updateAddress from "./update.js";
import deleteAddress from "./delete.js";
import getAddress from "./get.js";
import getSingleUserAddress from "./getSingle.js";
import tokenVerification from "../../../../middleware/token-verification/index.js";




const router = express.Router();

//--------- Get User Created Address for IsInPerson Service need----/
router.get("/all/:id",tokenVerification, getAddress);

//---------User Created Address for IsInPerson Service need----/
router.post("/",tokenVerification,addAddress);

//---------update Get User Created Address for IsInPerson Service need----/
router.put("/:id",tokenVerification,updateAddress);

//---------delete Get User Created Address for IsInPerson Service need----/
router.delete("/:id",tokenVerification, deleteAddress);


//---------Single Get User Created Address for IsInPerson Service need----/
router.get("/:id",tokenVerification, getSingleUserAddress);

export default router;
