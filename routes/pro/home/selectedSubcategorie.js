import Joi from "joi";
import { find, getAggregate } from "../../../helpers/index.js";
import { ObjectId } from "mongodb";

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
      const catId = item.categoryId;
      categoryIds.push(catId);

      categorySubMap[catId.toString()] = item.subCategories.map(sub => {
        const services = {};
        ["isRemote", "isChat", "isVirtual", "isInPerson"].forEach(key => {
          if (sub[key]) services[key] = true;
        });
        return {
          id: new ObjectId(sub.id),
          services,
        };
      });
    });

    const categorySubMapArr = Object.entries(categorySubMap).map(([catId, subItems]) => ({
      categoryId: new ObjectId(catId),
      subItems, // array of { id, services }
    }));

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
                  $let: {
                    vars: {
                      matchedCat: {
                        $first: {
                          $filter: {
                            input: categorySubMapArr,
                            as: "catMap",
                            cond: { $eq: ["$$catMap.categoryId", "$$categoryId"] }
                          }
                        }
                      }
                    },
                    in: {
                      $in: [
                        "$_id",
                        {
                          $map: {
                            input: { $ifNull: ["$$matchedCat.subItems", []] },
                            as: "sub",
                            in: "$$sub.id"
                          }
                        }
                      ]
                    }
                  }
                },
                services: {
                  $let: {
                    vars: {
                      matchedCat: {
                        $first: {
                          $filter: {
                            input: categorySubMapArr,
                            as: "catMap",
                            cond: { $eq: ["$$catMap.categoryId", "$$categoryId"] }
                          }
                        }
                      }
                    },
                    in: {
                      $let: {
                        vars: {
                          matchedSub: {
                            $first: {
                              $filter: {
                                input: { $ifNull: ["$$matchedCat.subItems", []] },
                                as: "sub",
                                cond: { $eq: ["$$sub.id", "$_id"] }
                              }
                            }
                          }
                        },
                        in: { $ifNull: ["$$matchedSub.services", {}] }
                      }
                    }
                  }
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
