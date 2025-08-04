import Joi from "joi";
import { getAggregate } from "../../../../helpers/index.js";
import mongoose from "mongoose";

const schema = Joi.object().keys({
  id: Joi.string().required(),
});

const schemaBody = Joi.object().keys({
  month: Joi.number().required(),
   year: Joi.number().required(),
});


const getPayments = async (req, res) => {
  try {
    await schema.validateAsync(req.params);
await schemaBody.validateAsync(req.body);

    const { id } = req.params;
const {month,year} = req.body
    const getUserPayment = await getAggregate("userPayment", [
  
      {
    $addFields: {
      monthNum: { $month: "$createdAt" },
      yearNum: { $year: "$createdAt" },
      month: { $dateToString: { format: "%B", date: "$createdAt" } },
      year: { $dateToString: { format: "%Y", date: "$createdAt" } }
    }
  },
  {
    $match: {
      userId: new mongoose.Types.ObjectId(id),
      monthNum: month,
      yearNum: year
    }
  },
  // 👤 Lookup for User Info
  {
    $lookup: {
      from: "users",
      localField: "userId",
      foreignField: "_id",
      as: "userInfo"
    }
  },
  {
    $unwind: {
      path: "$userInfo",
      preserveNullAndEmptyArrays: true
    }
  },
  // 👤 Lookup for Professional Info
  {
    $lookup: {
      from: "users",
      localField: "professsionalId",
      foreignField: "_id",
      as: "professionalInfo"
    }
  },
  {
    $unwind: {
      path: "$professionalInfo",
      preserveNullAndEmptyArrays: true
    }
  },
  // 📦 Lookup for BookService Info
  {
    $lookup: {
      from: "probookingservices",
      localField: "bookServiceId",
      foreignField: "_id",
      as: "bookServiceInfo"
    }
  },
  {
    $unwind: {
      path: "$bookServiceInfo",
      preserveNullAndEmptyArrays: true
    }
  },
  {
    $project: {
      _id: 1,
      amount: 1,
      paymentMethod: 1,
      status: 1,
      createdAt: 1,
      month: 1,
      year: 1,
      userFirstName: "$userInfo.firstName",
      proFirstName: "$professionalInfo.firstName",
      bookServiceTitle: "$bookServiceInfo.title" // or name, depending on schema
    }
  }
    ]);
    console.log(getUserPayment, "getUserReview");

if(!getUserPayment || getUserPayment.length == 0){
  return res.status(200).json({ status: 200, message: "No Reviews." });
}

    return res.status(200).json({ status: 200, getUserPayment });
  } catch (e) {
    console.log(e);
    return res.status(400).json({ status: 400, message: e.message });
  }
};

export default getPayments;
