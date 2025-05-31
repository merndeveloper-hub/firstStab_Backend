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

    // Pagination query params
    const limit = parseInt(req.query.limit) || 5;
    const page = parseInt(req.query.page) || 1;
    const skip = (page - 1) * limit;

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
      const catId = item.categoryId;
      categoryIds.push(catId);
      categorySubMap[catId.toString()] = item.subCategories.map(sub => sub.id);
    });

    const categorySubMapArr = Object.entries(categorySubMap).map(([catId, subIds]) => ({
      categoryId: new ObjectId(catId),
      subCategoryIds: subIds,
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
      },
      { $skip: skip },
      { $limit: limit }
    ]);

    // Step 3: Get Pro business name
    const getBusiness = await find("user", { _id: new ObjectId(id), userType: "pro" });

    if (!getBusiness || getBusiness.length === 0) {
      return res.status(400).send({
        status: 400,
        message: "No Business Info found"
      });
    }

    // Get total count (without pagination)
    const total = categoryIds.length;

    return res.status(200).json({
      status: 200,
      data: {
        categories,
        getBusinessName: getBusiness[0].businessname,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit)
        }
      }
    });

  } catch (e) {
    console.error(e);
    return res.status(400).json({ status: 400, message: e.message });
  }
};

export default getSelectedServiceCategory;
