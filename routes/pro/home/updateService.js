import Joi from "joi";
import {  updateDocument } from "../../../helpers/index.js";



const schema = Joi.object({
  businessname: Joi.string(),
  businessaddress: Joi.string(),
  businessphoneNo: Joi.string(),
  proId: Joi.string().hex().length(24).required(), // Must be a valid MongoDB ObjectId
 
});

const updateService = async (req, res) => {
  try {
   // await schema.validateAsync(req.body);


    const updateCategory = await updateDocument("user",{_id:req.body.proId,userType: 'pro'},
       {
        ...req.body,
      });

    return res.status(200).json({
      status: 200,
      message: "Subcategory updated successfully",
     updateCategory,
    });
  } catch (e) {
    return res.status(400).json({ status: 400, message: e.message });
  }
};

export default updateService;
