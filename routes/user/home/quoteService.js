import Joi from "joi";
import {
  findOne,
  insertNewDocument,
  find,
  getAggregate,
} from "../../../helpers/index.js";

const schema = Joi.object({
  userId: Joi.string().hex().length(24).required(), // Must be a valid MongoDB ObjectId
  professionalId: Joi.string().allow("").optional(),
 subCategorieId: Joi.string().hex().length(24).required(),
  categoryId: Joi.string().hex().length(24).required(),
 
});

const quoteService = async (req,res) => {
 try {
  const {userId,professionalId,subCategorieId,categoryId} =req.body

  const createQuote = await insertNewDocument('quoteService')

 return res.status(200).json({ status: 200, data:{createQuote} });
 } catch (e) {
   console.log(e);
    return res.status(400).json({ status: 400, message: e.message });
 }
}

export default quoteService;