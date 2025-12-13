import Joi from "joi";
import { getAggregate } from "../../../helpers/index.js";
import mongoose from "mongoose";

const schema = Joi.object().keys({
  id: Joi.string().required(),
});

const proServiceRequest = async (req, res) => {
  try {
    await schema.validateAsync(req.params);

    const { id } = req.params;

    const getProBookService = await getAggregate("proBookingService", [

      {
        $match: {
          bookServiceId: new mongoose.Types.ObjectId(id),
          status: "Accepted",
        },
      },
      {
        $lookup: {
          from: "users", // Join with "users" collection
          let: { professsionalId: { $toObjectId: "$professsionalId" } }, // Extract professsionalId
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$_id", "$$professsionalId"] },
              }, // Compare userId with _id in users collection
            },
            {
              $project: {
                first_Name: 1,
                last_Name: 1,
                avgReviewsPro: 1,
                totalReviewsPro: 1,
                quoteAmount: 1,
                _id: 0,
              }, // Return only required fields
            },
          ],
          as: "proDetails",
        },
      },
      {
        $lookup: {
          from: "subcategories", // Join with "users" collection
          let: { subCategoryId: { $toObjectId: "$subCategoryId" } }, // Extract professsionalId
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$_id", "$$subCategoryId"] },
              }, // Compare userId with _id in users collection
            },
            {
              $project: {
                categoryName: 1,
                name: 1,
                _id: 0,
              }, // Return only required fields
            },
          ],
          as: "procategories",
        },
      }







    ]);


    if (!getProBookService || getProBookService.length == 0) {
      return res.status(200).json({ status: 200, message: "No professional quotes available at the moment." });
    }

    return res.status(200).json({ status: 200, getProBookService });
  } catch (e) {
    console.log(e);
    return res.status(400).json({ status: 400, message: e.message });
  }
};

export default proServiceRequest;


