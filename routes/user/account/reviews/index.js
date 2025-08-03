import express from "express";
import reviewService from "./add.js";
import getReviews from "./get.js";







const router = express.Router();


router.get("/:id", getReviews);
 router.post("/",reviewService);


export default router;
