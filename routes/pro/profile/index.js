import express from "express";

import updateProfile from "./update.js";
import getSingleProfile from "./get.js";
//import tokenVerification from "../../../middleware/token-verification/index.js";


///Add Video and profile pic media--///
import multipart from "connect-multiparty";
import updateAvailability from "./updateAvailability.js";
import tokenVerification from "../../../middleware/token-verification/index.js";
const multipartMiddleware = multipart();

const router = express.Router();

//-------User and Pro Update Profile and Addresses------///
router.put(
  "/update/:id",tokenVerification,multipartMiddleware,
  updateProfile
);


// pro availability badge update
router.put("/availabilityUpdate/:id",updateAvailability)


// get pro profile
router.get("/:id",tokenVerification, getSingleProfile);

export default router;
