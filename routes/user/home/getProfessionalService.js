import Joi from "joi";
import mongoose from "mongoose";
import { getAggregate } from "../../../helpers/index.js";

const schema = Joi.object({
  categoryId: Joi.string().required(),
  subCategorieId: Joi.string().required(),
  servieType: Joi.string().required(),
});

const getProfessionalService = async (req, res) => {
  try {
    await schema.validateAsync(req.query);

    const { categoryId, subCategorieId, servieType } = req.query;
    console.log(req.query, "query");

    const proService = await getAggregate("proCategory", [
      {
        $match: {
          categoryId: new mongoose.Types.ObjectId(categoryId),
          status: "Active",
        },
      },
      {
        $project: {
proId: 1,
  price: 1,
  rating: 1,
  categoryId: 1,
  userBookServId: 1,
  complexity_tier: 1,
  price_model: 1,
  fixed_price: 1,
  min_price: 1,
  max_price: 1,
   status: 1,
  serviceStatus: 1,
  serviceCountry: 1,
  bgServiceName: 1,
  candidateId: 1,
  invitationUrl: 1,
  invitationId: 1,
  package: 1,
  candidateIdCertn: 1,
  invitationUrlCertn: 1,
  invitationIdCertn: 1,
  packageCertn: 1,

  bgValidation: 1,
  paymentStatus: 1,
  certificate: 1,
  platformLinks: 1,
  socialMediaVerification: 1,
  isCompany: 1,
  isUSBased: 1,
  governmentId: 1,
  selfAssessment: 1,
  certificationOrLicense: 1,
  proofOfInsurance: 1,
  companyRegistrationUrl: 1,
  formW9: 1,
  w8BenUrl: 1,
  w8BenEUrl: 1,
  otherDocuments: 1,
  passport: 1,
  drivingLicence: 1,
  selfieVideo: 1,
  createdAt: 1,
  updatedAt: 1, // Added due to `timestamps: true`,


          _id: 1,
          subCategories: 1,
          proId: 1,
          rating: 1,
          complexity_tier: 1,
          price_model: 1,
          fixed_price: 1,
          min_price: 1,
          max_price: 1,
          price: 1,
          categoryId: 1,
          subCategories: {
            $filter: {
              input: "$subCategories",
              as: "sub",
              cond: {
                $and: [
                  {
                    $eq: [
                      "$$sub.id",
                      new mongoose.Types.ObjectId(subCategorieId),
                    ],
                  },
                  { $eq: [`$$sub.${servieType}`, true] },
                ],
              },
            },
          },
        },
      },
      {
        $match: {
          "subCategories.0": { $exists: true },
        },
      },
      {
        $unwind: "$subCategories",
      },
      {
        $lookup: {
          from: "subcategories",
          let: { subCatId: "$subCategories.id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ["$_id", "$$subCatId"],
                },
              },
            },
            {
              $project: {
                categoryName: 1,
                name: 1,
              },
            },
          ],
          as: "subCategoryDetails",
        },
      },
      {
        $unwind: {
          path: "$subCategoryDetails",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "proId",
          foreignField: "_id",
          as: "proDetails",
        },
      },
      {
        $unwind: {
          path: "$proDetails",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "probookingservices",
          localField: "_id",
          foreignField: "proServiceId",
          as: "userBookingStatus",
        },
      },
      {
        $unwind: {
          path: "$userBookingStatus",
          preserveNullAndEmptyArrays: true,
        },
      },
      //   {
      //   $lookup: {
      //     from: "procategories",
      //     localField: "proId",
      //     foreignField: "proId",
      //     as: "proCategoriesdata",
      //   },
      // },
      // {
      //   $unwind: {
      //     path: "$proCategoriesdata",
      //     preserveNullAndEmptyArrays: true,
      //   },
      // },
      //{
    // $match: {
    //   $or: [
    //     { "userBookingStatus.status": { $ne: "Completed" } },
    //     { "userBookingStatus": { $eq: null } } // keep documents with no match
    //   ]
    // }
  //},
      {
        $group: {
          bookingRequestTime: {
            $first: "$proDetails.bookingRequestTime",
          },
          _id: "$_id",
          userbookingstatus: { $first: "$userBookingStatus.status" },
          quoteAmount:{ $first: "$userBookingStatus.quoteAmount" },
          //videoRoomName:{ $first: "$userBookingStatus.videoRoomName" },

          total_amount_cus_pay: {
            $first: "$userBookingStatus.total_amount_cus_pay",
          },
          total_amount: { $first: "$userBookingStatus.total_amount" },
          proBookingServiceId: { $first: "$userBookingStatus._id" },
          userBookServiceId: { $first: "$userBookingStatus.bookServiceId" },
          tax_fee: { $first: "$userBookingStatus.tax_fee" },
          service_fee: { $first: "$userBookingStatus.service_fee" },
          quoteInfo: { $first: "$userBookingStatus.quoteInfo" },
          quoteDetail: { $first: "$userBookingStatus.quoteDetail" },
          quoteAmount: { $first: "$userBookingStatus.quoteAmount" },
          subCategories: { $first: "$subCategories" },
          proId: { $first: "$proId" },
          rating: { $first: "$rating" },
          complexity_tier: { $first: "$complexity_tier" },
          price_model: { $first: "$price_model" },
          fixed_price: { $first: "$fixed_price" },
          min_price: { $first: "$min_price" },
          max_price: { $first: "$max_price" },
          price: { $first: "$price" },
          
  proId: { $first: "$proId" },
  price: { $first: "$price" },
  rating: { $first: "$rating" },
  categoryId: { $first: "$categoryId" },
  userBookServId: { $first: "$userBookServId" },
  complexity_tier: { $first: "$complexity_tier" },
  price_model: { $first: "$price_model" },
  fixed_price: { $first: "$fixed_price" },
  min_price: { $first: "$min_price" },
  max_price: { $first: "$max_price" },
 
  status: { $first: "$status" },
  serviceStatus: { $first: "$serviceStatus" },
  serviceCountry: { $first: "$serviceCountry" },
  bgServiceName: { $first: "$bgServiceName" },
  candidateId: { $first: "$candidateId" },
  invitationUrl: { $first: "$invitationUrl" },
  invitationId: { $first: "$invitationId" },
  package: { $first: "$package" },
  candidateIdCertn: { $first: "$candidateIdCertn" },
  invitationUrlCertn: { $first: "$invitationUrlCertn" },
  invitationIdCertn: { $first: "$invitationIdCertn" },
  packageCertn: { $first: "$packageCertn" },
 
  bgValidation: { $first: "$bgValidation" },
  paymentStatus: { $first: "$paymentStatus" },
  certificate: { $first: "$certificate" },
  platformLinks: { $first: "$platformLinks" },
  socialMediaVerification: { $first: "$socialMediaVerification" },
  isCompany: { $first: "$isCompany" },
  isUSBased: { $first: "$isUSBased" },
  governmentId: { $first: "$governmentId" },
  selfAssessment: { $first: "$selfAssessment" },
  certificationOrLicense: { $first: "$certificationOrLicense" },
  proofOfInsurance: { $first: "$proofOfInsurance" },
  companyRegistrationUrl: { $first: "$companyRegistrationUrl" },
  formW9: { $first: "$formW9" },
  w8BenUrl: { $first: "$w8BenUrl" },
  w8BenEUrl: { $first: "$w8BenEUrl" },
  otherDocuments: { $first: "$otherDocuments" },
  passport: { $first: "$passport" },
  drivingLicence: { $first: "$drivingLicence" },
  selfieVideo: { $first: "$selfieVideo" },
  createdAt: { $first: "$createdAt" },
  updatedAt: { $first: "$updatedAt" },


          categoryId: { $first: "$categoryId" },
          avgRating: { $first: "$avgReviewsPro" },
          first_Name: { $first: "$proDetails.first_Name" },
          last_Name: { $first: "$proDetails.last_Name" },
          badge: { $first: "$proDetails.badge" },
          totalJobCompleted: { $first: "$proDetails.totalJobCompleted" },
          totalJobCancelled: { $first: "$proDetails.totalJobCancelled" },
          totalJob: { $first: "$proDetails.totalJob" },
          responseRate: { $first: "$proDetails.responseRate" },
          responseTime: { $first: "$proDetails.responseTime" },
          availability: { $first: "$proDetails.availability" },
          bgCheck: { $first: "$proDetails.bgCheck" },
          totalRating: { $first: "$proDetails.totalRating" },
          profile: { $first: "$proDetails.profile" },
          video: { $first: "$proDetails.video" },
          country: { $first: "$proDetails.country" },
          state: { $first: "$proDetails.state" },
          time: { $first: "$proDetails.time" },
          businessname: { $first: "$proDetails.businessname" },
          name: { $first: "$subCategoryDetails.name" },
          categoryName: { $first: "$subCategoryDetails.categoryName" },
        },
      },
      {
        $sort: {
          _id: 1, // Replace with createdAt: 1 if you have a timestamp field
        },
      },
      {
        $project: {
          bookingRequestTime: 1,
        //  chatChannelName:1,
         // videoRoomName:1,
          _id: 1,
          proId: 1,
  price: 1,
  rating: 1,
  categoryId: 1,
  userBookServId: 1,
  complexity_tier: 1,
  price_model: 1,
  fixed_price: 1,
  min_price: 1,
  max_price: 1,
 quoteAmount:1,
  status: 1,
  serviceStatus: 1,
  serviceCountry: 1,
  bgServiceName: 1,
  candidateId: 1,
  invitationUrl: 1,
  invitationId: 1,
  package: 1,
  candidateIdCertn: 1,
  invitationUrlCertn: 1,
  invitationIdCertn: 1,
  packageCertn: 1,
 
  bgValidation: 1,
  paymentStatus: 1,
  certificate: 1,
  platformLinks: 1,
  socialMediaVerification: 1,
  isCompany: 1,
  isUSBased: 1,
  governmentId: 1,
  selfAssessment: 1,
  certificationOrLicense: 1,
  proofOfInsurance: 1,
  companyRegistrationUrl: 1,
  formW9: 1,
  w8BenUrl: 1,
  w8BenEUrl: 1,
  otherDocuments: 1,
  passport: 1,
  drivingLicence: 1,
  selfieVideo: 1,
  createdAt: 1,
  updatedAt: 1, // Added due to `timestamps: true`

          userbookingstatus: 1,
          proBookingServiceId: 1,
          userBookServiceId: 1,
          total_amount_cus_pay: 1,
          total_amount: 1,
          tax_fee: 1,
          service_fee: 1,
          quoteInfo: 1,
          quoteDetail: 1,
          quoteAmount: 1,
          categoryId: 1,
          subCategories: 1,
          proId: 1,
          rating: 1,
          complexity_tier: 1,
          price_model: 1,
          fixed_price: 1,
          min_price: 1,
          max_price: 1,
          price: 1,
          avgRating: 1,
          first_Name: 1,
          last_Name: 1,
          badge: 1,
          totalJobCompleted: 1,
          totalJobCancelled: 1,
          totalJob: 1,
          responseRate: 1,
          responseTime: 1,
          availability: 1,
          bgCheck: 1,
          totalRating: 1,
          profile: 1,
          video: 1,
          country: 1,
          state: 1,
          time: 1,
          name: 1,
          categoryName: 1,
          businessname: 1,
        },
      },
    ]);

    console.log(proService, "proService");

    if (!proService || proService.length === 0) {
      return res.status(400).json({
        status: 400,
        message: "No professionals available for the selected service",
      });
    }
   
    return res
      .status(200)
      .json({ status: 200, proService });
  } catch (e) {
    console.log("error", e.message);
    return res.status(400).json({ status: 400, message: e.message });
  }
};

export default getProfessionalService;
