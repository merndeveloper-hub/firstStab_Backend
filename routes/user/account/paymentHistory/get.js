import Joi from "joi";
import { getAggregate } from "../../../../helpers/index.js";
import mongoose from "mongoose";

const schema = Joi.object().keys({
  id: Joi.string().required(),
   month: Joi.number().required(),
   year: Joi.number().required(),
});

// const schemaBody = Joi.object().keys({
//   month: Joi.number().required(),
//    year: Joi.number().required(),
// });


const getPayments = async (req, res) => {
  try {
    await schema.validateAsync(req.params);
//await schemaBody.validateAsync(req.body);

    const { id,month,year } = req.params;
    console.log(req.params,"params");
    const monthNum = Number(month);
const yearNum = Number(year);
//const {month,year} = req.body
    const getUserPayment = await getAggregate("userPayment", [
  
     {
    $addFields: {
      monthNum: { $month: "$createdAt" },
      yearNum: { $year: "$createdAt" },
    }
  },
  {
  $match: {
    $and: [
      { monthNum: monthNum },
      { yearNum: yearNum },
      {
        $or: [
          { userId: new mongoose.Types.ObjectId(id) },
          { professsionalId: new mongoose.Types.ObjectId(id) }
        ]
      }
    ]
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
      _id: 1,
  userId: 1,
  professsionalId: 1,
  bookServiceId: 1,
   amount: 1,
  paymentMethod: 1,
  sender: 1,
  reciever: 1,
  type: 1,
  holdingName: 1,
  currency: 1,
  stripeSessionId: 1,
  presentmentAmount: 1,
  presentmentCurrency: 1,
  stripeSessionUrl: 1,
  paymentIntentId: 1,
  transactionId: 1,
  customerEmail: 1,
  paypalOrderId: 1,
  authorizationId: 1,
  payerId: 1,
  payerEmail: 1,
  "cardDetails.cardBrand": 1,
  "cardDetails.cardLast4": 1,
  "cardDetails.cardExpMonth": 1,
  "cardDetails.cardExpYear": 1,
  "cardDetails.cardFunding": 1,
  "cardDetails.cardCountry": 1,
  status: 1,
  "payer.payerId": 1,
  "payer.payerEmail": 1,
  "payer.payerFirstName": 1,
  "payer.payerLastName": 1,
  "payer.payerCountryCode": 1,
  "paymentSource.paypalAccountId": 1,
  "paymentSource.paypalEmail": 1,
  "paymentSource.paypalAccountStatus": 1,
  purchaseUnitReference: 1,
  paypalLink: 1,
      
  userFirstName: "$userInfo.first_Name",
  userLastName: "$userInfo.last_Name",
  userBadge: "$userInfo.badge",
  userTotalJobCompleted: "$userInfo.totalJobCompleted",
  userTotalJobCancelled: "$userInfo.totalJobCancelled",
  userTotalJob: "$userInfo.totalJob",
  userResponseRate: "$userInfo.responseRate",
  userResponseTime: "$userInfo.responseTime",
  userAvailability: "$userInfo.availability",
  userBgCheck: "$userInfo.bgCheck",
  userTotalRating: "$userInfo.totalRating",
  userEmail: "$userInfo.email",
  userCountry: "$userInfo.country",
  userMobile: "$userInfo.mobile",
  userPassword: "$userInfo.password",
  userTotalPro: "$userInfo.totalPro",
  userType: "$userInfo.userType",
  userStatus: "$userInfo.status",
  userCreatedAt: "$userInfo.createdAt",
  userUpdatedAt: "$userInfo.updatedAt",
  userBusinessAddress: "$userInfo.businessaddress",
  userBusinessName: "$userInfo.businessname",
  userBusinessPhoneNo: "$userInfo.businessphoneNo",
  userAddressType: "$userInfo.address_Type",
  userAddressLine1: "$userInfo.address_line1",
  userAddressLine2: "$userInfo.address_line2",
  userCity: "$userInfo.city",
  userLatitude: "$userInfo.latitude",
  userLongitude: "$userInfo.longitude",
  userState: "$userInfo.state",
  userZipCode: "$userInfo.zipCode",
  userProfile: "$userInfo.profile",
  userBookingRequestTime: "$userInfo.bookingRequestTime",
  userId: "$userInfo._id",

      professionalFirstName: "$professionalInfo.first_Name",
  professionalLastName: "$professionalInfo.last_Name",
  professionalBadge: "$professionalInfo.badge",
  professionalTotalJobCompleted: "$professionalInfo.totalJobCompleted",
  professionalTotalJobCancelled: "$professionalInfo.totalJobCancelled",
  professionalTotalJob: "$professionalInfo.totalJob",
  professionalResponseRate: "$professionalInfo.responseRate",
  professionalResponseTime: "$professionalInfo.responseTime",
  professionalAvailability: "$professionalInfo.availability",
  professionalBgCheck: "$professionalInfo.bgCheck",
  professionalTotalRating: "$professionalInfo.totalRating",
  professionalEmail: "$professionalInfo.email",
  professionalCountry: "$professionalInfo.country",
  professionalMobile: "$professionalInfo.mobile",
  professionalPassword: "$professionalInfo.password",
  professionalTotalPro: "$professionalInfo.totalPro",
  professionalUserType: "$professionalInfo.userType",
  professionalStatus: "$professionalInfo.status",
  professionalCreatedAt: "$professionalInfo.createdAt",
  professionalUpdatedAt: "$professionalInfo.updatedAt",
  professionalBusinessAddress: "$professionalInfo.businessaddress",
  professionalBusinessName: "$professionalInfo.businessname",
  professionalBusinessPhoneNo: "$professionalInfo.businessphoneNo",
  professionalAddressType: "$professionalInfo.address_Type",
  professionalAddressLine1: "$professionalInfo.address_line1",
  professionalAddressLine2: "$professionalInfo.address_line2",
  professionalCity: "$professionalInfo.city",
  professionalLatitude: "$professionalInfo.latitude",
  professionalLongitude: "$professionalInfo.longitude",
  professionalState: "$professionalInfo.state",
  professionalZipCode: "$professionalInfo.zipCode",
  professionalProfile: "$professionalInfo.profile",
  professionalBookingRequestTime: "$professionalInfo.bookingRequestTime",
  professionalId: "$professionalInfo._id",

     bookServiceId: "$bookServiceInfo._id",
  bookServiceMedia: "$bookServiceInfo.media",
  bookServiceServiceImage: "$bookServiceInfo.serviceImage",
  bookServiceUserId: "$bookServiceInfo.userId",
  bookServiceProfessionalId: "$bookServiceInfo.professsionalId",
  bookServiceProServiceId: "$bookServiceInfo.proServiceId",
  bookServiceBookServiceId: "$bookServiceInfo.bookServiceId",
  bookServiceCategoryId: "$bookServiceInfo.categoryId",
  bookServiceSubCategoryId: "$bookServiceInfo.subCategoryId",
  bookServiceAddInstruction: "$bookServiceInfo.addInstruction",
  bookServiceStartedTime: "$bookServiceInfo.StartedTime",
  bookServiceFinishedTime: "$bookServiceInfo.FinishedTime",
  bookServiceCancelDateTime: "$bookServiceInfo.CancelDateTime",
  bookServiceCancelCharges: "$bookServiceInfo.CancelCharges",
  bookServiceCancelSlot: "$bookServiceInfo.CancelSlot",
  bookServiceExtendedTime: "$bookServiceInfo.ExtendedTime",
  bookServiceExtensionCharges: "$bookServiceInfo.ExtensionCharges",
  bookServiceRequestId: "$bookServiceInfo.requestId",
  bookServiceCancelledReason: "$bookServiceInfo.cancelledReason",
  bookServiceServiceType: "$bookServiceInfo.serviceType",
  bookServiceProblemDescription: "$bookServiceInfo.problemDescription",
  bookServiceQuotesReceived: "$bookServiceInfo.quotesReceived",
  bookServiceOrderStartDate: "$bookServiceInfo.orderStartDate",
  bookServiceOrderStartTime: "$bookServiceInfo.orderStartTime",
  bookServiceOrderEndDate: "$bookServiceInfo.orderEndDate",
  bookServiceOrderEndTime: "$bookServiceInfo.orderEndTime",
  bookServiceServiceAssign: "$bookServiceInfo.serviceAssign",
  bookServiceOrderRescheduleStatus: "$bookServiceInfo.orderRescheduleStatus",
  bookServiceOrderRescheduleStartTime: "$bookServiceInfo.orderRescheduleStartTime",
  bookServiceOrderRescheduleStartDate: "$bookServiceInfo.orderRescheduleStartDate",
  bookServiceOrderRescheduleEndDate: "$bookServiceInfo.orderRescheduleEndDate",
  bookServiceOrderExtendStatus: "$bookServiceInfo.orderExtendStatus",
  bookServiceOrderRescheduleEndTime: "$bookServiceInfo.orderRescheduleEndTime",
  bookServiceOrderExtendEndTime: "$bookServiceInfo.orderExtendEndTime",
  bookServiceOrderRescheduleRequest: "$bookServiceInfo.orderRescheduleRequest",
  bookServiceStatus: "$bookServiceInfo.status",
  bookServiceOrderRatingPending: "$bookServiceInfo.orderRatingPending",
  bookServiceComplexityTier: "$bookServiceInfo.complexity_tier",
  bookServicePriceModel: "$bookServiceInfo.price_model",
  bookServiceFixedPrice: "$bookServiceInfo.fixed_price",
  bookServiceMinPrice: "$bookServiceInfo.min_price",
  bookServiceMaxPrice: "$bookServiceInfo.max_price",
  bookServiceCreatedAt: "$bookServiceInfo.createdAt",
  bookServiceUpdatedAt: "$bookServiceInfo.updatedAt",
  bookServiceQuoteAmount: "$bookServiceInfo.quoteAmount",
  bookServiceQuoteDetail: "$bookServiceInfo.quoteDetail",
  bookServiceQuoteInfo: "$bookServiceInfo.quoteInfo",
  bookServiceServiceFee: "$bookServiceInfo.service_fee",
  bookServiceTaxFee: "$bookServiceInfo.tax_fee",
  bookServiceTotalAmount: "$bookServiceInfo.total_amount",
  bookServiceTotalAmountCusPay: "$bookServiceInfo.total_amount_cus_pay",
  bookServiceChatChannelName: "$bookServiceInfo.chatChannelName"
    }
  }
    ]);
    console.log(getUserPayment, "getUserReview");

if(!getUserPayment || getUserPayment.length == 0){
  return res.status(200).json({ status: 200, message: "Payment not found!" });
}

    return res.status(200).json({ status: 200, getUserPayment });
  } catch (e) {
    console.log(e);
    return res.status(400).json({ status: 400, message: e.message });
  }
};

export default getPayments;
