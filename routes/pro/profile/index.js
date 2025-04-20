import express from "express";

import updateProfile from "./update.js";
import getSingleProfile from "./get.js";
//import tokenVerification from "../../../middleware/token-verification/index.js";


///Add Video and profile pic media--///
import multipart from "connect-multiparty";
const multipartMiddleware = multipart();

const router = express.Router();

//-------User and Pro Update Profile and Addresses------///
router.put(
  "/update/:id",multipartMiddleware,
  updateProfile
);

router.get("/:id", getSingleProfile);

export default router;
