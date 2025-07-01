// auth.js
import axios from 'axios'


const getAccessToken = async (req,res) => {
  try {

     const {type} = req.body
    // // Base64-encoded credentials (replace with your actual credentials)a
     const authHeader = `Basic ${process.env.STERLING_BASE_URL}`;
    
    // console.log(authHeader,"auth");
    
    // // API endpoint
     const url = `${process.env.STERLING_API_URL}`;
    // console.log(url,"url");
    
    // // Request configuration
    // const config = {
    //   headers: {
    //     Authorization: authHeader,
    //     'Content-Type': 'application/x-www-form-urlencoded',
    //   },
    // };

    // Base64-encoded credentials (replace with your actual credentials)
//const authHeader = 'Basic QXBpVXNlckZpcnN0U3RhYjpTdGVybGluZzIwMjIh';

// API endpoint
//const url = 'https://api.us.int.sterlingcheck.app/v2/oauth';

// Request configuration
const config = {
  headers: {
    Authorization: authHeader,
    'Content-Type': 'application/x-www-form-urlencoded',
  },
};

// Request body (URL-encoded)
//const data = 'grant_type=client_credentials';
   // console.log(data,"data");
    
    // Request body (URL-encoded)
    //const data = 'grant_type=client_credentials';
    const data = type
   
    
    // Send POST request
    const response = await axios.post(url, data, config)
    

    console.log(response.data,"response");
    
   
return res.status(201).json({status:201,message:response.data})

  } catch (error) {
   console.log(error,"error");
   return res.status(400).json({status:400,message:error.message})
    // throw new Error("Authentication failed");
  }
};

export default getAccessToken;



