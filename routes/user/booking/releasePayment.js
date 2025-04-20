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


// 4️⃣ Step 2: Release Payment After Service Completion
// Jab service complete ho jaye, tab Stripe Capture API se payment release karein.

const releasePayment = async (req, res) => {
  try {
   // await validationSchema.validateAsync(req.body);
    const {id} = req.params
    

    const payment = await findOne('payment',{_id:id});
    if (!payment || payment.status !== "Pending") {
      return res.status(400).json({ error: "Invalid or already processed payment" });
  }

   

    // Step 1: Capture the Payment
    await stripe.paymentIntents.capture(payment.transactionId);

    // Step 2: Update Payment Status in Database
  
const paymentUpdate = await updateDocument('payment',{_id:id},{satus:"Released"})

   
    return res.status(200).json({ status: 200, message: "Payment released successfully" });
  } catch (e) {
    console.log(e);
    return res.status(500).json({ status: 500, message: e.message });
  }
};

export default releasePayment;


