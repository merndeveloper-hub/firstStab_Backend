import Joi from "joi";
import { deleteManyDocument, insertManyDocuments, insertNewDocument, updateDocument } from "../../../helpers/index.js";
import userType from "../../../models/userType/index.js";


const schema = Joi.object({
  businessname: Joi.string(),
  businessaddress: Joi.string(),
  businessphoneNo: Joi.string(),
  proId: Joi.string().hex().length(24).required(), // Must be a valid MongoDB ObjectId
  // price: Joi.number().min(0).required(),
  // categoryId: Joi.string().hex().length(24).required(),
  // subCategories: Joi.array().items(
  //   Joi.object({
  //     id: Joi.string().hex().length(24).required(),
  //     isRemote: Joi.boolean(),
  //     isChat: Joi.boolean(),
  //     isVirtual: Joi.boolean(),
  //     isInPerson: Joi.boolean(),
  //   })
  // ),
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
