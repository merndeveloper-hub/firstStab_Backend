import Joi from "joi";
import { deleteManyDocument, insertManyDocuments, insertNewDocument, updateDocument } from "../../../helpers/index.js";
import proCategory from "../../../models/proCategorie/index.js";

const schema = Joi.object({
  businessname: Joi.string(),
  businessaddress: Joi.string(),
  businessphoneNo: Joi.string(),
  proId: Joi.string().hex().length(24).required(), // Must be a valid MongoDB ObjectId
  price: Joi.number().min(0).required(),
  categoryId: Joi.string().hex().length(24).required(),
  subCategories: Joi.array().items(
    Joi.object({
      id: Joi.string().hex().length(24).required(),
      isRemote: Joi.boolean(),
      isChat: Joi.boolean(),
      isVirtual: Joi.boolean(),
      isInPerson: Joi.boolean(),
    })
  ),
});

const updateService = async (req, res) => {
  try {
   // await schema.validateAsync(req.body);


const {proId} = req.body[0]
console.log(proId,"body");

const deleteCategory = await deleteManyDocument("proCategory",{proId:proId})
console.log(deleteCategory,"delete");

const category = await proCategory.insertMany(req.body);
console.log(category, "insert");


//     const category = await insertManyDocuments("proCategory", 
//       [...req.body],
//     );
// console.log(category,"category");

    const proInfo = await updateDocument("user",{_id:proId}, {
      ...req.body,
    });

    return res.status(200).json({
      status: 200,
      message: "Category updated successfully",
     category,
    });
  } catch (e) {
    return res.status(400).json({ status: 400, message: e.message });
  }
};

export default updateService;
