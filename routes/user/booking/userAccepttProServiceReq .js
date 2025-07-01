// import Joi from "joi";
// import { find, findOne, getAggregate, insertNewDocument, updateDocument } from "../../../helpers/index.js";
// import Stripe from "stripe";
// let stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// import mongoose, { Mongoose } from "mongoose";
// //mport getProfessional from "./getProfessionalService.js";

// const validationSchema = Joi.object({
  
//   professionalId: Joi.string().required(),
//   amount: Joi.number().required(),
//   currency: Joi.string(),
//   paymentMethod: Joi.string().required(),
//   userId: Joi.string().required(),
//   cardNumber: Joi.string().required(),
//   cardExpiryDate: Joi.string().required(),
//   cardCVC: Joi.string().required(),
//   holdingName: Joi.string(),
// });




// const userAcceptProServiceRequest = async (req, res) => {
//   try {
//     await validationSchema.validateAsync(req.body);
//     const {id} = req.params
//     const { userId,professionalId, amount, currency,cardCVC,cardExpiryDate,cardNumber} = req.body;


//     const proBookingService = await findOne('proBookingService',{_id:id});
//     if(!proBookingService){
//       return res.status(400).json({
//         status: 400,
//         message: "Service not found!",
//       });
//     }
  
//   //  quoteAmount: { type: schemaType.TypeNumber },
//   //   paypal_fee: { type: schemaType.TypeNumber},
//   //   service_fee: { type: schemaType.TypeNumber},
//   //   tax_fee: { type: schemaType.TypeNumber},
//   //   total_amount: { type: schemaType.TypeNumber },
//   //   total_amount_cus_pay: { type: schemaType.TypeNumber },
//   //   quoteInfo: { type: schemaType.TypeString, maxlength: 2000 },
//   //   quoteDetail: { type: schemaType.TypeString }, // Text in MongoDB is stored as a long string
  
//   //   quoteCreatedDateTime: { type: Date, default: Date.now },
  
//       const findUser = await findOne('user',{_id:userId});
//       if(!findUser){
//         return res.status(400).json({
//           status: 400,
//           message: "User has not found",
//         });
//       }
  
//   // Split the string
//   const [month, year] = cardExpiryDate.split('/');
  
//   // Convert YY to YYYY
//   const exp_month = parseInt(month, 10); // Convert to number
//   const exp_year = 2000 + parseInt(year, 10); // Convert YY to YYYY
  
//   console.log(exp_month, exp_year); // Output: 9 2025
  
//   let paymentMethod = await stripe.paymentMethods.create({
//     type:'card',
//     card:{
//       number:cardNumber,
//       exp_month,
//       exp_year,
//       cvc:cardCVC
//     },
//   });
  

//  // Step 1: Create Payment Intent (Hold Payment in Escrow)
// //Jab client service book kare, to Stripe Payment Intent create karna hoga with "capture_method": "manual", taake payment hold me rahe.

//       // Create Stripe Payment Intent
//       const paymentIntent = await stripe.paymentIntents.create({
//         amount: amount * 100, // Convert to cents
//         currency: currency || "usd",
//         payment_method: paymentMethod.id,
//         confirm: true,
//         capture_method: "manual", // Hold payment (Escrow)
//         payment_method_types:['card'],
//       });
  
//       console.log(paymentIntent,"payment");
      
  
//       const paymentRes = await insertNewDocument(
//         "payment",
  
//         {
//          ...req.body,
//           paymentMethod: "stripe",
//           transactionId: paymentIntent.id,
//           status: "Pending",
//         }
//       );
//       if (!paymentRes) {
//         return res.status(400).json({
//           status: 400,
//           message: "Payment not succesfully done!",
//         });
//       }
//     return res.status(200).json({ status: 200, paymentRes });
//   } catch (e) {
//     console.log(e);
//     return res.status(500).json({ status: 500, message: e.message });
//   }
// };

// export default userAcceptProServiceRequest;


