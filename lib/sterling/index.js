import express from 'express'
import getAccessToken from './auth.js';
import getPackages from './packages.js';
import getProduct from './getProduct.js';
import getSingleProduct from './getSingleProduct.js';
import getProductForm from './getProductForm.js';


const router = express.Router();

router.post("/auth", getAccessToken)
router.get("/package", getPackages)
router.get("/product", getProduct)
router.get("/Singleproduct", getSingleProduct)
router.get("/getProductForm", getProductForm)

 export default router
