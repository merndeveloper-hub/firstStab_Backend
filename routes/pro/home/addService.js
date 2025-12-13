import Joi from "joi";
import { insertNewDocument, findOne, find } from "../../../helpers/index.js";

const subCategorySchema = Joi.object({
  id: Joi.string().hex().length(24).required(),
  isRemote: Joi.boolean(),
  isChat: Joi.boolean(),
  isVirtual: Joi.boolean(),
  isInPerson: Joi.boolean(),
}).custom((value, helpers) => {
  const { isRemote, isChat, isVirtual, isInPerson } = value;

  if (!isRemote && !isChat && !isVirtual && !isInPerson) {
    return helpers.error('any.invalid');
  }

  return value;
}).messages({
   'any.invalid': 'Please select at least one service mode: isRemote, isChat, isVirtual, or isInPerson.',
});

const schema = Joi.object({
  id: Joi.string().hex().length(24),
  proId: Joi.string().hex().length(24).required(), // Must be a valid MongoDB ObjectId
  price: Joi.number().min(0).allow(null, ""),
  categoryId: Joi.string().hex().length(24).required(),
  complexity_tier: Joi.string().required(),
  price_model: Joi.string().required(),
  fixed_price: Joi.number().allow(null, ""),
  min_price: Joi.number().allow(null, ""),
  max_price: Joi.number().allow(null, ""),
  subCategories: Joi.array().items(subCategorySchema),
});

const createService = async (req, res) => {
  try {
    await schema.validateAsync(req.body);
    const {
      proId,
      categoryId,
      subCategories,
      complexity_tier,
      price_model,
      fixed_price,
      min_price,
      max_price,
    } = req.body;

    //GET Subcategory pricing price_model
    let getSubcategory = await findOne("subCategory", {
      _id: subCategories[0].id,
      price_model,
    });
    

    if (price_model == "fixed" && getSubcategory?.price_model == "fixed") {
      let getFixedPrice = Number(getSubcategory?.fixed_price) == fixed_price;
      if (!getFixedPrice) {
        return res.status(400).json({
          status: 400,
          message: `The fixed price for this service is ${Number(
            getSubcategory?.fixed_price
          )}`,
        });
      }
    } else if (
      price_model == "range" &&
      getSubcategory?.price_model == "range"
    ) {                         
      let getMinPrice = Number(getSubcategory?.min_price) <= min_price;  
   
      
      let getMaxPrice = Number(getSubcategory?.max_price) <= max_price;
      if (!getMinPrice) {
        return res.status(400).json({
          status: 400,
          message: `The minimum price must be at least ${Number(getSubcategory?.min_price)}`,
        });
      }
      if (!getMaxPrice) {
        return res.status(400).json({
          status: 400,
          message:`The maximum price must not exceed ${Number(getSubcategory?.max_price)}`,
        });
      }
    }
    // else if(price_model == "quote_only" && getSubcategory?.price_model == "quote_only"){

    // }

    //* less than 5000 pro certificate condition   *//
    const findPro = await findOne("user", {
      _id: proId,
      totalPro: { $lt: 5000 }, // $lt means "less than"
    });
    if (findPro) {
      const subCategoryId = subCategories[0]?.id;
      // check subcategory already exist
      const findService = await findOne("proCategory", {
        proId,
        categoryId,
        "subCategories.id": subCategoryId,
      });
    

      // Check if a document already exists with the same proId, categoryId, and subCategory id
      if (findService) {
        return res.status(400).json({
          status: 400,
          message: "This category and subcategory already exists",
        });
      }

      // check documents already exist
      const findbg = await find("proCategory", {
        proId,
        status: "Active" || "InActive" || "Pending",
      });
    


      //* less than 5k documents apply  *//
      if (findbg) {
        const category = await insertNewDocument("proCategory", {
          ...req.body,
          //  status: "InActive",
          status: "InActive",
        });

        return res.status(200).json({
          status: 200,
          message: "Category created successfully",
          data: category,
          user: "free",
          bg: "apply",
        });
      }


      //* apply bg  less than 5k documents   *//
      const category = await insertNewDocument("proCategory", {
        ...req.body,
        //  status: "InActive",
        status: "InActive",
      });

      return res.status(200).json({
        status: 200,
        message: "Category created successfully",
        data: category,
        user: "free",
        bg: "not apply",
      });
    }

    console.log("GREATER THAN 5000");
//* Greater than 5000 pro certificate condition   *//
    const subCategoryId = subCategories[0]?.id;

    const findService = await findOne("proCategory", {
      proId,
      categoryId,
      "subCategories.id": subCategoryId,
    });
  

    //* Check if a document already exists with the same proId, categoryId, and subCategory id *//
    if (findService) {
      return res.status(400).json({
        status: 400,
        message: "This category and subcategory already exists",
      });
    }

    //
    const findSubCategory = await findOne("subCategory", {
      _id: subCategoryId,
      categoryId,
    });

  

    // ** checkr --> basic_plus , basic_criminal_and_plv ,agr basic_plis lya how hain is mein basic_criminal_and_plv yeh bhe cover ho jta hain **//
    if (
      findSubCategory?.bgServiceName == "checkr" &&
      findSubCategory?.bgPackageName == "basic_plus"
    ) {
      const findService = await find("proCategory", {
        proId,
        bgServiceName: findSubCategory?.bgServiceName,
        package: findSubCategory?.bgPackageName || "basic_criminal_and_plv",
      });

    

      if (findService.length > 0) {
    

        const category = await insertNewDocument("proCategory", {
          ...req.body,
          //  status: "InActive",
          status: "Pending",
        });

        return res.status(200).json({
          status: 200,
          message: "Category created successfully",
          data: category,
          user: "not free",
          bg: "apply",
        });
      }

      const category = await insertNewDocument("proCategory", {
        ...req.body,
        //  status: "InActive",
        status: "Pending",
      });

    

      return res.status(200).json({
        status: 200,
        message: "Category created successfully",
        data: category,
        user: "not free",
        bg: "not apply",
      });
    } else if (     // ** checkr --> plv , basic_criminal_and_plv ,agr plv lya how hain is mein basic_criminal_and_plv yeh bhe cover ho jta hain **//

      findSubCategory?.bgServiceName == "checkr" &&
      findSubCategory?.bgPackageName == "plv"
    ) {
      const findService = await find("proCategory", {
        proId,
        bgServiceName: findSubCategory?.bgServiceName,
        package: findSubCategory?.bgPackageName || "basic_criminal_and_plv",
      });

      if (findService.length > 0) {
        const category = await insertNewDocument("proCategory", {
          ...req.body,
          //  status: "InActive",
          status: "Pending",
        });

        return res.status(200).json({
          status: 200,
          message: "Category created successfully",
          data: category,
          user: "not free",
          bg: "apply",
        });
      }

      const category = await insertNewDocument("proCategory", {
        ...req.body,
        //  status: "InActive",
        status: "Pending",
      });

      return res.status(200).json({
        status: 200,
        message: "Category created successfully",
        data: category,
        user: "not free",
        bg: "not apply",
      });
    } else if ( // ** checkr --> agr basic_criminal_and_plv  lya how hain is mein plv,basic_plus yeh bhe cover ho jta hain **//

      findSubCategory?.bgServiceName == "checkr" &&
      findSubCategory?.bgPackageName == "basic_criminal_and_plv"
    ) {
      const findService = await find("proCategory", {
        proId,
        bgServiceName: findSubCategory?.bgServiceName,
        package: findSubCategory?.bgPackageName || "basic_plus" || "plv",
      });

      if (findService.length > 0) {
        const category = await insertNewDocument("proCategory", {
          ...req.body,
          //  status: "InActive",
          status: "Pending",
        });

        return res.status(200).json({
          status: 200,
          message: "Category created successfully",
          data: category,
          user: "not free",
          bg: "apply",
        });
      }

      const category = await insertNewDocument("proCategory", {
        ...req.body,
        //  status: "InActive",
        status: "Pending",
      });

      return res.status(200).json({
        status: 200,
        message: "Category created successfully",
        data: category,
        user: "not free",
        bg: "not apply",
      });
    } else if (findSubCategory?.bgServiceName == "certn") { //* certn bg check **//
      const findService = await find("proCategory", {
        proId,
        bgServiceName: findSubCategory?.bgServiceName,
      });

      if (findService.length > 0) {
        const category = await insertNewDocument("proCategory", {
          ...req.body,
          //  status: "InActive",
          status: "Pending",
        });

        return res.status(200).json({
          status: 200,
          message: "Category created successfully",
          data: category,
          user: "not free",
          bg: "apply",
        });
      }

      const category = await insertNewDocument("proCategory", {
        ...req.body,
        //  status: "InActive",
        status: "Pending",
      });

      return res.status(200).json({
        status: 200,
        message: "Category created successfully",
        data: category,
        user: "not free",
        bg: "not apply",
      });
    }

    const category = await insertNewDocument("proCategory", {
      ...req.body,
      //  status: "InActive",
      status: "Pending",
    });

    return res.status(200).json({
      status: 200,
      message: "Category created successfully",
      data: category,
       user: "not free",
        bg: "not apply",
    });
  } catch (e) {
    return res.status(400).json({ status: 400, message: e.message });
  }
};

export default createService;
