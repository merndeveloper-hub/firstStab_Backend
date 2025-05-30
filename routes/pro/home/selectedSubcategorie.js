import Joi from "joi";
import { find, getAggregate } from "../../../helpers/index.js";
import { ObjectId } from "mongodb"; // Import ObjectId

const schema = Joi.object().keys({
  id: Joi.string().required(),
});

const getSelectedServiceCategory = async (req, res) => {
  try {
    await schema.validateAsync(req.params);
    const { id } = req.params;

    // Step 1: Get selected proCategory data
    const proCategoryList = await find("proCategory", { proId: new ObjectId(id) });

    if (!proCategoryList || proCategoryList.length === 0) {
      return res.status(400).send({
        status: 400,
        message: "Service Not found",
      });
    }

    const categorySubMap = {};
    const categoryIds = [];

    proCategoryList.forEach(item => {
      const catId = item.categoryId; // Already ObjectId
      categoryIds.push(catId);
      // Map categoryId to array of subCategory ObjectIds
      categorySubMap[catId.toString()] = item.subCategories.map(sub => sub.id);
    });

    // Convert categorySubMap object into array to pass to aggregation pipeline
    const categorySubMapArr = Object.entries(categorySubMap).map(([catId, subIds]) => ({
      categoryId: new ObjectId(catId),
      subCategoryIds: subIds, // Array of ObjectId
    }));

    // Step 2: Get full category and subcategory details with selected flags
    const categories = await getAggregate("category", [
      {
        $match: {
          _id: { $in: categoryIds }
        }
      },
      {
        $lookup: {
          from: "subcategories",
          let: { categoryId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$categoryId", "$$categoryId"] }
              }
            },
            {
              $addFields: {
                selected: {
                  $in: [
                    "$_id",
                    {
                      $let: {
                        vars: {
                          matchedCat: {
                            $first: {
                              $filter: {
                                input: categorySubMapArr,
                                cond: { $eq: ["$$this.categoryId", "$$categoryId"] }
                              }
                            }
                          }
                        },
                        in: {
                          $ifNull: ["$$matchedCat.subCategoryIds", []]
                        }
                      }
                    }
                  ]
                }
              }
            }
          ],
          as: "subCategory"
        }
      },
      {
        $sort: { _id: -1 }
      }
    ]);

    // Step 3: Get Pro business name
    const getBusiness = await find("user", { _id: new ObjectId(id), userType: "pro" });

    if (!getBusiness || getBusiness.length === 0) {
      return res.status(400).send({
        status: 400,
        message: "No Business Info found"
      });
    }

    return res.status(200).json({
      status: 200,
      data: {
        categories,
        getBusinessName: getBusiness[0].businessname
      }
    });

  } catch (e) {
    console.error(e);
    return res.status(400).json({ status: 400, message: e.message });
  }
};

export default getSelectedServiceCategory;
