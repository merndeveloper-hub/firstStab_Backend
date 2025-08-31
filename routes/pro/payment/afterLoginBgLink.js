import mongoose from "mongoose";
import { getAggregate } from "../../../helpers/index.js";

const afterLoginBgLink = async (req, res) => {
  try {
    const { id } = req.params;

  
  const getService = await getAggregate("proCategory", [
  {
    $match: {
      proId: new mongoose.Types.ObjectId(id),
      status: { $in: ["Pending"] },
    },
  },
  // 🔑 Unwind subCategories so each element becomes a doc
  { $unwind: "$subCategories" },

  {
    $lookup: {
      from: "subcategories",
      let: { subCategoryId: { $toObjectId: "$subCategories.id" } },
      pipeline: [
        {
          $match: {
            $expr: { $eq: ["$_id", "$$subCategoryId"] },
          },
        },
        {
          $project: {
            _id: 1,
            categoryId: 1,
            categoryName: 1,
            name: 1,
            image: 1,
            icon: 1,
            complexity_tier: 1,
            price_model: 1,
            fixed_price: 1,
            min_price: 1,
            max_price: 1,
            isRemote: 1,
            isChat: 1,
            isVirtual: 1,
            isInPerson: 1,
            commission: 1,
            description: 1,
            addToHome: 1,
            status: 1,
            serviceCountry: 1,
            bgServiceName: 1,
            bgPackageName: 1,
            bgValidation: 1,
            created_date: 1,
            createdAt: 1,
            updatedAt: 1,
            __v: 1,
          },
        },
      ],
      as: "subCategoryData",
    },
  },
  {
    $lookup: {
      from: "categories",
      let: { categoryId: { $toObjectId: "$categoryId" } },
      pipeline: [
        {
          $match: {
            $expr: { $eq: ["$_id", "$$categoryId"] },
          },
        },
        {
          $project: {
            _id: 1,
            categoryId: 1,
            categoryName: 1,
            name: 1,
            image: 1,
            icon: 1,
            complexity_tier: 1,
            price_model: 1,
            fixed_price: 1,
            min_price: 1,
            max_price: 1,
            isRemote: 1,
            isChat: 1,
            isVirtual: 1,
            isInPerson: 1,
            commission: 1,
            description: 1,
            addToHome: 1,
            status: 1,
            serviceCountry: 1,
            bgServiceName: 1,
            bgPackageName: 1,
            bgValidation: 1,
            created_date: 1,
            createdAt: 1,
            updatedAt: 1,
            __v: 1,
          },
        },
      ],
      as: "categoryData",
    },
  },
]);

    return res
      .status(200)
      .json({
        status: 200,
        data: { getService },
      });
  } catch (e) {
    console.log(e);
    return res.status(400).json({ status: 400, message: e.message });
  }
};

export default afterLoginBgLink;
