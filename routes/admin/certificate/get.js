import Joi from "joi";
import { findOne, getAggregate } from "../../../helpers/index.js";
import mongoose from "mongoose";


const schema = Joi.object().keys({
  id: Joi.string().required(),
});

const getSingleProCertificate = async (req, res) => {
  try {
    await schema.validateAsync(req.params);
    const { id } = req.params;

    const singlePro = await findOne("user", { _id: id });

    if (!singlePro || singlePro.length === 0) {
      return res.status(400).send({
        status: 400,
        message: "No Professional found",
      });
    }

    const getCertificate = await getAggregate("proCategory", [
      // Step 1: Match documents based on userId and status
      {
        $match: { proId: new mongoose.Types.ObjectId(id) } // Match categoryId
      },

      {
        $unwind: "$subCategories"
      },
      {
        $lookup: {
          from: "subcategories",
          let: { subCategoryId: { $toObjectId: "$subCategories.id" } },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$_id", "$$subCategoryId"] }
              }
            },
            {
              $project: {
                categoryName: 1,
                name: 1,
                image: 1,
                icon: 1,
                _id: 0
              }
            }
          ],
          as: "procategories"
        }
      },



      { $sort: { createdAt: -1 } },

    ]);

  

    return res.status(200).json({ status: 200, data: { singlePro, getCertificate } });
  } catch (e) {
    console.log(e);
    return res.status(400).json({ status: 400, message: e.message });
  }
};

export default getSingleProCertificate;
