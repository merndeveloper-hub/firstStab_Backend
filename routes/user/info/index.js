import express from "express";



import getContentPage from "./get.js";
import singleContentPage from "./getSingle.js";
import contactUs from "./contactUs.js";
import getInfo from "./getinfo.js";
import getFaqQuestion from "./getFAQ.js";


const router = express.Router();
router.get('/getques', getFaqQuestion)

router.get("/", getContentPage);
//router.post("/add",multipartMiddleware, addCategory);
 //router.put("/:id",multipartMiddleware, updateCategory);
 //router.delete("/:id", deleteCategory);
// Get Single Blog
router.get("/:id", singleContentPage);

// Contact Us
router.get("/contact/:id", getInfo);
router.post("/:id", contactUs);


// FAQ Questions

export default router;
