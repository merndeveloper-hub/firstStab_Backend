
import { find, getAggregate } from "../../../helpers/index.js";




const getBooking = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 5;
    const skip = (page - 1) * limit;


    const bookService = await getAggregate("proBookingService", [
      // Step 1: Match documents based on userId and status


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
      },
      {
        $lookup: {
          from: "users", // Join with "users" collection
          let: { professionalId: { $toObjectId: "$professsionalId" } }, // Extract professsionalId
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$_id", "$$professionalId"] },
              }, // Compare userId with _id in users collection
            },
            {
              $project: {
                first_Name: 1,
                last_Name: 1,
                // avgReviewsPro: 1,
                // totalReviewsPro: 1,
                // businessname: 1,
                // businessaddress: 1,
                // businessphoneNo: 1,
                // longitude: 1,
                // latitude: 1,
                _id: 1,
              }, // Return only required fields
            },
          ],
          as: "proDetails",
        },
      },
      {
        $lookup: {
          from: "users", // Join with "users" collection
          let: { userId: { $toObjectId: "$userId" } }, // Extract professsionalId
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$_id", "$$userId"] },
              }, // Compare userId with _id in users collection
            },
            {
              $project: {
                first_Name: 1,
                last_Name: 1,
                //  avgReviewsPro: 1,
                //   totalReviewsPro: 1,
                // businessname: 1,
                // businessaddress: 1,
                // businessphoneNo: 1,
                // longitude: 1,
                // latitude: 1,
                _id: 1,
              }, // Return only required fields
            },
          ],
          as: "userDetails",
        },
      },

      {
        $lookup: {
          from: "addresses", // Join with "users" collection
          let: { addressId: { $toObjectId: "$addressId" } }, // Extract professsionalId
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$_id", "$$addressId"] },
              }, // Compare userId with _id in users collection
            },
            {
              $project: {
                longitude: 1,
                latitude: 1,
                _id: 0,
              }, // Return only required fields
            },
          ],
          as: "userAddress",
        },
      },
      // Sort, skip, limit
      { $sort: { createdAt: -1 } },
      { $skip: skip },
      { $limit: limit },
    ]);

    if (!bookService || bookService.length == 0) {
      return res
        .status(200)
        .json({ status: 200, message: "No Booking Found!" });
    }

    const totalCountResult = await find("proBookingService");
    const totalLength = totalCountResult?.length || 0;

    return res.status(200).send({
      status: 200,
      data: {
        bookService,
        totalLength,
      },
    });


  } catch (e) {
    console.log(e);
    return res.status(400).json({ status: 400, message: e.message });
  }
};

export default getBooking;
