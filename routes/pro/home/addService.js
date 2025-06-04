import Joi from "joi";
import { insertNewDocument, findOne } from "../../../helpers/index.js";

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

    // less than 5000 pro certificate condition
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
      console.log(findService, "findService");

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
      console.log(findbg, "findbg");

      if (findbg) {
        const category = await insertNewDocument("proCategory", {
          ...req.body,
          //  status: "InActive",
          status: "Pending",
        });

        return res.status(200).json({
          status: 200,
          message: "Category created successfully",
          data: category,
          user: "free",
          bg: "apply",
        });
      }

      // apply bg
      const category = await insertNewDocument("proCategory", {
        ...req.body,
        //  status: "InActive",
        status: "pending",
      });

      return res.status(200).json({
        status: 200,
        message: "Category created successfully",
        data: category,
        user: "free",
        bg: "not apply",
      });
    }

    const subCategoryId = subCategories[0]?.id;

    const findService = await findOne("proCategory", {
      proId,
      categoryId,
      "subCategories.id": subCategoryId,
    });
    console.log(findService, "findService");

    // Check if a document already exists with the same proId, categoryId, and subCategory id

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

    if (
      findSubCategory?.bgServiceName == "checkr" &&
      findSubCategory?.bgPackageName == "basic_plus"
    ) {
      const findService = await find("proCategory", {
        bgServiceName: findSubCategory?.bgServiceName,
        package: findSubCategory?.bgPackageName,
      });

      if (findService) {
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
    } else if (
      findSubCategory?.bgServiceName == "checkr" &&
      findSubCategory?.bgPackageName == "plv"
    ) {
      const findService = await find("proCategory", {
        bgServiceName: findSubCategory?.bgServiceName,
        package: findSubCategory?.bgPackageName,
      });

      if (findService) {
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
    } else if (
      findSubCategory?.bgServiceName == "checkr" &&
      findSubCategory?.bgPackageName == "basic_criminal_and_plv"
    ) {
      const findService = await find("proCategory", {
        bgServiceName: findSubCategory?.bgServiceName,
        package: findSubCategory?.bgPackageName,
      });

      if (findService) {
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
    } else if (findSubCategory?.bgServiceName == "certn") {
      const findService = await find("proCategory", {
        bgServiceName: findSubCategory?.bgServiceName,
      });

      if (findService) {
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
    });
  } catch (e) {
    return res.status(400).json({ status: 400, message: e.message });
  }
};

export default createService;
