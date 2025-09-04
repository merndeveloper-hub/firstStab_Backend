import express from "express";
import reviewService from "./add.js";
import getReviews from "./get.js";
import tokenVerification from "../../../../middleware/token-verification/index.js";







const router = express.Router();


router.get("/:id",tokenVerification, getReviews);
 router.post("/",tokenVerification,reviewService);


export default router;
