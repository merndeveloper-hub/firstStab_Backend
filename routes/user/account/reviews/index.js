import express from "express";
import reviewService from "./add.js";







const router = express.Router();


// router.get("/", getAddress);
 router.post("/",reviewService);


export default router;
