import Joi from "joi";
import { find, findOne, getAggregate, insertNewDocument, updateDocument } from "../../../helpers/index.js";
import Stripe from "stripe";
let stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

import mongoose, { Mongoose } from "mongoose";
//mport getProfessional from "./getProfessionalService.js";

const validationSchema = Joi.object({
  
  professionalId: Joi.string().required(),
  amount: Joi.number().required(),
  currency: Joi.string(),
  paymentMethod: Joi.string().required(),
  userId: Joi.string().required(),
  cardNumber: Joi.string().required(),
  cardExpiryDate: Joi.string().required(),
  cardCVC: Joi.string().required(),
  holdingName: Joi.string(),
});


// 5️⃣ Step 3: Refund Payment (If Required)
// Agar client ko refund dena ho, to pehle ye check karein ke payment capture hui hai ya nahi.

const refundPayment = async (req, res) => {
  try {
   // await validationSchema.validateAsync(req.body);
    const {id} = req.params
    

    const payment = await findOne('payment',{_id:id});
    if (!payment || payment.status =="Refunded") {
      return res.status(400).json({ error: "Invalid or already refunded payment" });
  }

  //🔹 Agar payment release ho chuki hai, to refund API use hogi. Agar hold me hai, to cancel kiya jayega.
  // Step 1: Refund Payment (If Already Released)
  if (payment.status === "Released") {
      await stripe.refunds.create({
        transactionId: payment.transactionId,
      });
  } else {
      // If Payment is Still on Hold, Cancel it
      await stripe.paymentIntents.cancel(payment.transactionId);
  }

  // Step 2: Update Payment Status in Database

  
const paymentUpdate = await updateDocument('payment',{_id:id},{satus:"Refunded"})

   
    return res.status(200).json({ status: 200, message: "Payment refunded successfully" });
  } catch (e) {
    console.log(e);
    return res.status(500).json({ status: 500, message: e.message });
  }
};

export default refundPayment;


