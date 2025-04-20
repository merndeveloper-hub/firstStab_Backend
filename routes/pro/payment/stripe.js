import Joi from "joi";
import { findOne, insertNewDocument } from "../../../helpers/index.js";
import Stripe from "stripe";

let stripe = new Stripe(process.env.STRIPE_SECRET_KEY);




const validationSchema = Joi.object({
  amount: Joi.number().required(),
  currency: Joi.string(),
  paymentMethod: Joi.string().required(),
  userId: Joi.string().required(),
  cardNumber: Joi.string().required(),
  cardExpiryDate: Joi.string().required(),
  cardCVC: Joi.string().required(),
  holdingName: Joi.string(),
});




const stripePayment = async (req, res) => {
  try {
    await validationSchema.validateAsync(req.body);
    console.log(req.body);

    const { userId, amount, currency,cardCVC,cardExpiryDate,cardNumber} = req.body;
console.log(cardExpiryDate,"cardExpiryDate");

    const findUser = await findOne('user',{_id:userId});
    if(!findUser){
      return res.status(400).json({
        status: 400,
        message: "User has not found",
      });
    }

// Split the string
const [month, year] = cardExpiryDate.split('/');

// Convert YY to YYYY
const exp_month = parseInt(month, 10); // Convert to number
const exp_year = 2000 + parseInt(year, 10); // Convert YY to YYYY

console.log(exp_month, exp_year); // Output: 9 2025

let paymentMethod = await stripe.paymentMethods.create({
  type:'card',
  card:{
    number:cardNumber,
    exp_month,
    exp_year,
    cvc:cardCVC
  },
});

    // Create Stripe Payment Intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100, // Convert to cents
      currency: currency || "usd",
      payment_method: paymentMethod.id,
      confirm: true,
      payment_method_types:['card'],
    });

    console.log(paymentIntent,"payment");
    

    const paymentRes = await insertNewDocument(
      "payment",

      {
       ...req.body,
        paymentMethod: "stripe",
        transactionId: paymentIntent.id,
        status: "Success",
      }
    );
    if (!paymentRes) {
      return res.status(400).json({
        status: 400,
        message: "Payment not succesfully done!",
      });
    }

    return res.status(200).json({
      status: 200,
      data: paymentRes,
    });
  } catch (e) {
    console.log(e);
    return res.status(500).json({ status: 500, message: e.message });
  }
};

export default stripePayment;
