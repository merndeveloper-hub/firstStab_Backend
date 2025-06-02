import Joi from "joi";
import { insertNewDocument,findOne } from "../../../helpers/index.js";


const schema = Joi.object({
  id: Joi.string().hex().length(24),
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

const createService = async (req, res) => {
  try {
    await schema.validateAsync(req.body);

  const { proId, categoryId, subCategories } = req.body;
const subCategoryId = subCategories[0]?.id;

    const findService = await findOne("proCategory", {
     proId,categoryId,"subCategories.id": subCategoryId
    });
    console.log(findService,"findService");
    
    // Check if a document already exists with the same proId, categoryId, and subCategory id
    

    if (findService) {
      return res.status(400).json({
        status: 400,
        message: "This category and subcategory already exists",
      });
    }

    const category = await insertNewDocument("proCategory", {
      ...req.body,
      status: "InActive",
    });

    // const findPro = await findOne("user", { _id: proId, userType: "pro" });

    // const findSubCategorie = await findOne("subCategory", {
    //   _id: req?.body?.subCategories[0]?.id,
    // });

    // const serviceCountry = findSubCategorie?.serviceCountry;
    // const bgServiceName = findSubCategorie?.bgServiceName;
    // const bgValidation = findSubCategorie?.bgValidation;
    // const userCountry = findPro?.country;
    // const id = proId;
    // const proCategoryId = category?._id;

    // const invitationURL = await createCandidates(
    //   id,
    //   bgServiceName,
    //   bgValidation,
    //   serviceCountry,
    //   userCountry,
    //   proCategoryId
    // );

    return res.status(200).json({
      status: 200,
      message: "Category created successfully",
      data: category,
    });
  } catch (e) {
    return res.status(400).json({ status: 400, message: e.message });
  }
};

export default createService;
