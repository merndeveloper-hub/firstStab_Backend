// auth.js
import axios from 'axios'


const getProduct = async (req,res) => {
  try {

    console.log(req.headers,"headers");
    
     const {authorization} = req.headers
   

// GET PRODUCTS
  let productCode = 'CRIMGLB' 
const url =  `https://api.us.int.sterlingcheck.app/v2/products/${productCode}/variants` 

// Request configuration
const config = {
  headers: {
    Authorization: authorization,
    'Content-Type': 'application/x-www-form-urlencoded',
  },
};


    // GET PACKAGES
    const response = await axios.get(url, config)
    console.log(response.data,"response");
    
   
return res.status(201).json({status:201,message:response.data})

  } catch (error) {
   console.log(error,"error");
   return res.status(400).json({status:400,message:error.message})
    // throw new Error("Authentication failed");
  }
};

export default getProduct;



