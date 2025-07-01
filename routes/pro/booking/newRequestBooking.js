import Joi from "joi";
import { find, findOne, getAggregate } from "../../../helpers/index.js";
import mongoose from "mongoose";
import getProfessional from "./getProfessionalService.js";

const schema = Joi.object().keys({
  id: Joi.string().required()
});

const newRequestBooking = async (req, res) => {
  try {
    await schema.validateAsync(req.params);

    const { id } = req.params;

    const proBookService = await findOne("user", { _id: id });

    if (!proBookService || proBookService.length == 0) {
      return res.status(400).json({ status: 400, message: "User Not Found" });
    }

    const getProBookService = await getAggregate("proBookingService", [
      {
        $match: {
          professsionalId: new mongoose.Types.ObjectId(id),
          status: { $in: ["Accepted", "Pending"] },
        },
      },
      {
        $lookup: {
          from: "users", // Join with "user" collection
          let: { userId: { $toObjectId: "$userId" } }, // Extract userId from proBookingService
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$_id", "$$userId"] },
              }, // Compare userId with _id in user collection
            },
            {
              $project: { first_Name: 1, last_Name: 1, _id: 0 }, // Return only firstName & lastName
            },
          ],
          as: "userDetails",
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
                  categoryName:1,
                  name: 1,  
                  _id: 0,
                }, // Return only required fields
              },
            ],
            as: "procategories",
          },
        },
      {
        $addFields: {
          subCategories: {
            serviceType: "$serviceType", // Use the serviceType field from proBookService
          },
        },
      },
      // {
      //   $project: {
      //     professsionalId: 1,
      //     status: 1,
      //     userDetails: 1,
      //     subcategory: 1, // Include the new subcategory object
      //     serviceType: 0, // Exclude the original serviceType field if not needed
      //   },
      // },

      // {
      //   $match: {
      //     professsionalId: new mongoose.Types.ObjectId(id),
      //     status: {$in:["Accepted","Pending"]}
      //   },
      // },
      // {
      //   $lookup: {
      //     from: "users", // Join with "user" collection
      //     let: { userId: { $toObjectId: "$userId" } }, // Extract userId from proBookingService
      //     pipeline: [
      //       {
      //         $match: {
      //           $expr: { $eq: ["$_id", "$$userId"] },
      //         }, // Compare userId with _id in user collection
      //       },
      //       {
      //         $project: { first_Name: 1, last_Name: 1, _id: 0 }, // Return only firstName & lastName
      //       },
      //     ],
      //     as: "userDetails",
      //   },
      // },
      // {
      //   $lookup: {
      //     from: "subcategories", // Join with "users" collection
      //     let: { subCategoryId: { $toObjectId: "$subCategoryId" } }, // Extract professsionalId
      //     pipeline: [
      //       {
      //         $match: {
      //           $expr: { $eq: ["$_id", "$$subCategoryId"] },
      //         }, // Compare userId with _id in users collection
      //       },
      //       {
      //         $project: {
      //           categoryName:1,
      //           name: 1,  
      //           _id: 0,
      //         }, // Return only required fields
      //       },
      //     ],
      //     as: "procategories",
      //   },
      // }
    
    ]);

    console.log(getProBookService,"getProBookService");
    

    if (!getProBookService || getProBookService.length == 0) {
      return res
        .status(200)
        .json({ status: 200, message: "No New Service Request Found!" });
    }

    return res.status(200).json({ status: 200, getProBookService });
  } catch (e) {
    console.log(e);
    return res.status(400).json({ status: 400, message: e.message });
  }
};

export default newRequestBooking;
