import Joi from "joi";
import { findOne, updateDocument } from "../../../helpers/index.js";
import taxJarCal from "../../../lib/taxCollector/index.js";

const schema = Joi.object().keys({
  id: Joi.string().required(),
});

const schemaBody = Joi.object().keys({
  quoteAmount: Joi.number(),
  quoteInfo: Joi.string().allow(null, ''),
  quoteDetail: Joi.string().allow(null, ''),
  paypal_fee: Joi.string(),
  service_fee: Joi.string(),
  tax_fee: Joi.string(),
  total_amount: Joi.string(),
  total_amount_cus_pay: Joi.string()
});

const updateNewRequestBooking = async (req, res) => {
  try {
    await schema.validateAsync(req.params);
    await schemaBody.validateAsync(req.body);
    const { id } = req.params;
    const {  quoteAmount,quoteInfo, quoteDetail,paypal_fee,service_fee,tax_fee,total_amount,total_amount_cus_pay } = req.body;


  
    const proBookService = await findOne("proBookingService", { _id: id });


    if (!proBookService || proBookService.length == 0) {
      return res
        .status(400)
        .json({ status: 400, message: "Does not exist new booking service!" });
    }


//Payment Cal

const registerationFees = await findOne("adminFees")

    if (paymentMethod == "paypal") {
      const baseAmount = parseFloat(registerationFees?.registerationFees); // from frontend or DB
  
    }

// PayPal fee calculation
const feePercentage = 3.49 / 100;
const fixedFee = 0.49;

// Get tax from TaxJar (assumed to be a number)
let user = proBookService?.userId
const getTaxVal = await taxJarCal(user);
// if (typeof getTaxVal !== 'number') {
//   throw new Error("Invalid tax value from TaxJar");
// }
console.log(getTaxVal, "getTaxVal---");

// Calculate PayPal fee and total charge
const paypalFee = parseFloat((baseAmount * feePercentage + fixedFee + Number(getTaxVal)).toFixed(2));
const finalAmount = parseFloat((baseAmount + paypalFee).toFixed(2)); // This is what user pays


    const findUserBookService = await findOne("userBookServ", {
      _id: proBookService.bookServiceId,
    });

    console.log(findUserBookService,"findUserBookService");
    

    const updateUserBookService = await updateDocument(
      "userBookServ",
      { _id: findUserBookService._id },
      {
        
        quoteCount: findUserBookService.quoteCount + 1,
       // proBookingServiceId: id,
      }
    );

    // Emit data to React Native frontend via Socket.io
  //  req.io.emit("updateBookingService", findUserBookService);

if(proBookService?.quoteAmount){
 const updateProBookService = await updateDocument(
      "proBookingService",
      { _id: id },
      { status: "Accepted",service_fee:0.05,tax_fee:1.5,total_amount:Number(proBookService?.quoteAmount)+0.05+1.5 ,total_amount_cus_pay:Number(proBookService?.quoteAmount)+0.05+1.5 }
    );
      return res
      .status(200)
      .json({
        status: 200,
        message: "Pro quoted service",
        data: { updateProBookService },
      });
}else if(proBookService?.fixed_price){
 const updateProBookService = await updateDocument(
      "proBookingService",
      { _id: id },
      { status: "Accepted",service_fee:0.05,tax_fee:1.5,total_amount:Number(proBookService?.fixed_price)+0.05+1.5 ,total_amount_cus_pay:Number(proBookService?.fixed_price)+0.05+1.5 }
    );
      return res
      .status(200)
      .json({
        status: 200,
        message: "Pro quoted service",
        data: { updateProBookService },
      });
}else if(quoteAmount){
 const updateProBookService = await updateDocument(
      "proBookingService",
      { _id: id },
      { status: "Accepted",service_fee:0.05,tax_fee:1.5,total_amount:quoteAmount+0.05+1.5 ,total_amount_cus_pay:quoteAmount+0.05+1.5 }
    );
      return res
      .status(200)
      .json({
        status: 200,
        message: "Pro quoted service",
        data: { updateProBookService },
      });
}

    // const updateProBookService = await updateDocument(
    //   "proBookingService",
    //   { _id: id },
    //   { status: "Accepted",...req.body,service_fee:0.05,tax_fee:1.5,total_amount:req.body.quoteAmount+0.05+1.5 ,total_amount_cus_pay:req.body.quoteAmount+0.05+1.5 }
    // );

    // return res
    //   .status(200)
    //   .json({
    //     status: 200,
    //     message: "Pro quoted service",
    //     data: { updateProBookService },
    //   });
  } catch (e) {
    console.log(e);
    return res.status(400).json({ status: 400, message: e.message });
  }
};

export default updateNewRequestBooking;
