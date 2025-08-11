import Joi from "joi";
import { getAggregate } from "../../../helpers/index.js";
import mongoose from "mongoose";

const schema = Joi.object().keys({
  id: Joi.string().required(),
  user: Joi.string().required(),
});

const getBookingChats = async (req, res) => {
  try {
    await schema.validateAsync(req.params);

    const { id,user } = req.params;

    if(user == 'user'){
 const getProBookChat = await getAggregate("chatMessage", [
      {
        $match: {
         $or: [
      { senderId: id },
     // { receiverId: id }
    ]
        },
      },
      {
        $sort: {
          createdAt: -1,
        },
      },
      {
        $group: {
          _id: "$receiverId", // Group by receiverId
          latestMessage: { $first: "$$ROOT" }, // Get the latest message per receiver
        },
      },
      {
        $replaceRoot: { newRoot: "$latestMessage" }, // Bring latestMessage to root
      },
      // Lookup for receiver (proDetails)
      {
        $lookup: {
          from: "users",
          let: { receiverId: { $toObjectId: "$receiverId" } },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$_id", "$$receiverId"] },
              },
            },
            {
              $project: {
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
                email: 1,
                country: 1,
                mobile: 1,
                password: 1,
                totalPro: 1,
                userType: 1,
                status: 1,
                createdAt: 1,
                updatedAt: 1,
                businessaddress: 1,
                businessname: 1,
                businessphoneNo: 1,
                address_Type: 1,
                address_line1: 1,
                address_line2: 1,
                city: 1,
                latitude: 1,
                longitude: 1,
                state: 1,
                zipCode: 1,
                profile: 1,
                bookingRequestTime: 1,
                _id: 1,
              },
            },
          ],
          as: "proDetails",
        },
      },
      // Lookup for sender (userDetails)
      {
        $lookup: {
          from: "users",
          let: { senderId: { $toObjectId: "$senderId" } },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$_id", "$$senderId"] },
              },
            },
            {
              $project: {
                first_Name: 1,
                last_Name: 1,
                profile: 1,
                // ... add more fields as needed
              },
            },
          ],
          as: "userDetails",
        },
      },
      // Lookup for proBooking
      {
        $lookup: {
          from: "probookingservices",
          let: { proBooking: { $toObjectId: "$proBooking" } },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$_id", "$$proBooking"] },
              },
            },
            {
              $project: {
                _id: 1,
                media: 1,
                serviceImage: 1,
                userId: 1,
                professsionalId: 1,
                proServiceId: 1,
                bookServiceId: 1,
                categoryId: 1,
                subCategoryId: 1,
                addInstruction: 1,
                StartedTime: 1,
                FinishedTime: 1,
                CancelDateTime: 1,
                CancelCharges: 1,
                CancelSlot: 1,
                ExtendedTime: 1,
                ExtensionCharges: 1,
                requestId: 1,
                cancelledReason: 1,
                serviceType: 1,
                problemDescription: 1,
                quotesReceived: 1,
                orderStartDate: 1,
                orderStartTime: 1,
                orderEndDate: 1,
                orderEndTime: 1,
                serviceAssign: 1,
                orderRescheduleStatus: 1,
                orderRescheduleStartTime: 1,
                orderRescheduleStartDate: 1,
                orderRescheduleEndDate: 1,
                orderExtendStatus: 1,
                orderRescheduleEndTime: 1,
                orderExtendEndTime: 1,
                orderRescheduleRequest: 1,
                status: 1,
                orderRatingPending: 1,
                complexity_tier: 1,
                price_model: 1,
                fixed_price: 1,
                min_price: 1,
                max_price: 1,
                createdAt: 1,
                updatedAt: 1,
                quoteAmount: 1,
                quoteDetail: 1,
                quoteInfo: 1,
                service_fee: 1,
                tax_fee: 1,
                total_amount: 1,
                total_amount_cus_pay: 1,
                chatChannelName: 1,
              },
            },
          ],
          as: "proBookingDetails",
        },
      },
    ]);
    console.log(getProBookChat, "getProBookService");

    if (!getProBookChat || getProBookChat.length == 0) {
      return res.status(200).json({ status: 200, message: "No Inbox" });
    }

    return res.status(200).json({ status: 200, getProBookChat });
    }
    else{
    const getProBookChat = await getAggregate("chatMessage", [
      {
        $match: {
         $or: [
      { senderId: id },
     // { receiverId: id }
    ]
        },
      },
      {
        $sort: {
          createdAt: -1,
        },
      },
      {
        $group: {
          _id: "$receiverId", // Group by receiverId
          latestMessage: { $first: "$$ROOT" }, // Get the latest message per receiver
        },
      },
      {
        $replaceRoot: { newRoot: "$latestMessage" }, // Bring latestMessage to root
      },
      // Lookup for receiver (proDetails)
      {
        $lookup: {
          from: "users",
          let: { receiverId: { $toObjectId: "$receiverId" } },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$_id", "$$receiverId"] },
              },
            },
            {
              $project: {
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
                email: 1,
                country: 1,
                mobile: 1,
                password: 1,
                totalPro: 1,
                userType: 1,
                status: 1,
                createdAt: 1,
                updatedAt: 1,
                businessaddress: 1,
                businessname: 1,
                businessphoneNo: 1,
                address_Type: 1,
                address_line1: 1,
                address_line2: 1,
                city: 1,
                latitude: 1,
                longitude: 1,
                state: 1,
                zipCode: 1,
                profile: 1,
                bookingRequestTime: 1,
                _id: 1,
              },
            },
          ],
          as: "userDetails",
        },
      },
      // Lookup for sender (userDetails)
      {
        $lookup: {
          from: "users",
          let: { senderId: { $toObjectId: "$senderId" } },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$_id", "$$senderId"] },
              },
            },
            {
              $project: {
                first_Name: 1,
                last_Name: 1,
                profile: 1,
                // ... add more fields as needed
              },
            },
          ],
          as: "proDetails",
        },
      },
      // Lookup for proBooking
      {
        $lookup: {
          from: "probookingservices",
          let: { proBooking: { $toObjectId: "$proBooking" } },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$_id", "$$proBooking"] },
              },
            },
            {
              $project: {
                _id: 1,
                media: 1,
                serviceImage: 1,
                userId: 1,
                professsionalId: 1,
                proServiceId: 1,
                bookServiceId: 1,
                categoryId: 1,
                subCategoryId: 1,
                addInstruction: 1,
                StartedTime: 1,
                FinishedTime: 1,
                CancelDateTime: 1,
                CancelCharges: 1,
                CancelSlot: 1,
                ExtendedTime: 1,
                ExtensionCharges: 1,
                requestId: 1,
                cancelledReason: 1,
                serviceType: 1,
                problemDescription: 1,
                quotesReceived: 1,
                orderStartDate: 1,
                orderStartTime: 1,
                orderEndDate: 1,
                orderEndTime: 1,
                serviceAssign: 1,
                orderRescheduleStatus: 1,
                orderRescheduleStartTime: 1,
                orderRescheduleStartDate: 1,
                orderRescheduleEndDate: 1,
                orderExtendStatus: 1,
                orderRescheduleEndTime: 1,
                orderExtendEndTime: 1,
                orderRescheduleRequest: 1,
                status: 1,
                orderRatingPending: 1,
                complexity_tier: 1,
                price_model: 1,
                fixed_price: 1,
                min_price: 1,
                max_price: 1,
                createdAt: 1,
                updatedAt: 1,
                quoteAmount: 1,
                quoteDetail: 1,
                quoteInfo: 1,
                service_fee: 1,
                tax_fee: 1,
                total_amount: 1,
                total_amount_cus_pay: 1,
                chatChannelName: 1,
              },
            },
          ],
          as: "proBookingDetails",
        },
      },
    ]);
    console.log(getProBookChat, "getProBookService");

    if (!getProBookChat || getProBookChat.length == 0) {
      return res.status(200).json({ status: 200, message: "No Inbox" });
    }

    return res.status(200).json({ status: 200, getProBookChat });
  }
  } catch (e) {
    console.log(e);
    return res.status(400).json({ status: 400, message: e.message });
  }
};

export default getBookingChats;
