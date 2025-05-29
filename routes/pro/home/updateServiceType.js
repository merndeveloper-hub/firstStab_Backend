
import {  updateDocument } from "../../../helpers/index.js";


// const schema = Joi.object({
//   proId: Joi.string().hex().length(24).required(), // Must be a valid MongoDB ObjectId
//   price: Joi.number().min(0).required(),
//   categoryId: Joi.string().hex().length(24).required(),
//   subCategories: Joi.array().items(
//     Joi.object({
//       id: Joi.string().hex().length(24).required(),
//       isRemote: Joi.boolean(),
//       isChat: Joi.boolean(),
//       isVirtual: Joi.boolean(),
//       isInPerson: Joi.boolean(),
//     })
//   ),
// });

const updateServiceType = async (req, res) => {
  try {
  // await schema.validateAsync(req.body);





const { id} = req.params


 


    const updateCategory = await updateDocument("proCategory",{_id:id},
     {
      ...req.body,
    });

    return res.status(200).json({
      status: 200,
      message: "Category updated successfully",
     updateCategory,
    });
  } catch (e) {
    return res.status(400).json({ status: 400, message: e.message });
  }
};

export default updateServiceType;
