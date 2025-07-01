import Joi from "joi";
import { insertNewDocument } from "../../../helpers/index.js";

const schema = Joi.object({
  userId: Joi.string().hex().length(24).required(), // Must be a valid MongoDB ObjectId
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
      })
    


const addCategory = async (req, res) => {
  try {
    console.log(req.body,"body");
    
    const { error, value } = schema.validate(req.body, { abortEarly: false });

    if (error) {
      console.error("Validation Error:", error);
      return res
        .status(400)
        .json({ success: false, message: error.details[0].message });
    }


  
    const category = await insertNewDocument("proCategory", {
      ...req.body,
    
    });
console.log(category,"category11");

    return res
      .status(200)
      .json({ status: 200, message: "Category uploaded successfully", category});
  } catch (e) {
    console.log(e,"chec");
    return res.status(500).json({ status: 500, message: e.message });
  }
};

export default addCategory;

