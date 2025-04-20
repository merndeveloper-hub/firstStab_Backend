import express from "express";
import subSubAddCategory from "./add-category.js";
// const deleteBlog = require("./delete-blog");
// const getBlogs = require("./get-blogs");
// const getSingleBlog = require("./get-single-blog");
// const updateBlog = require("./update-blog");

const router = express.Router();

//router.get("/", getBlogs);
router.post("/add", subSubAddCategory);
// router.put("/:id", updateBlog);
// router.delete("/:id", deleteBlog);
// Get Single Blog
//router.get("/single/:id", getSingleBlog);

export default router;
