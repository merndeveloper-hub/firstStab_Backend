import express from "express";

import createbusiness from "./add.js";
import getBusinInfo from "./get.js";
import updateBusiness from "./update.js";
import tokenVerification from "../../../middleware/token-verification/index.js";




const router = express.Router();


//-----Add Pro Buniness Info-------//
router.post(
  "/add",tokenVerification,
  createbusiness
);

//-----Get Pro Buniness Info-------//
router.get(
  "/:id",tokenVerification,
  getBusinInfo
);

//-----Update Pro Buniness Info-------//
router.put(
  "/:id",tokenVerification,
  updateBusiness
);

export default router;
