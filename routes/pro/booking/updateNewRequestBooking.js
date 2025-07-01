import Joi from "joi";
import { findOne, updateDocument } from "../../../helpers/index.js";

const schema = Joi.object().keys({
  id: Joi.string().required(),
});

const schemaBody = Joi.object().keys({
  quoteAmount: Joi.number().required(),
  quoteInfo: Joi.string(),
  quoteDetail: Joi.string(),
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
    const { quoteAmount, quoteInfo, quoteDetail,paypal_fee,service_fee,tax_fee,total_amount,total_amount_cus_pay } = req.body;


  
    const proBookService = await findOne("proBookingService", { _id: id });


    if (!proBookService || proBookService.length == 0) {
      return res
        .status(400)
        .json({ status: 400, message: "Does not exist new booking service!" });
    }
console.log(proBookService,"proBookService");

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

    const updateProBookService = await updateDocument(
      "proBookingService",
      { _id: id },
      { status: "Accepted",...req.body,service_fee:0.05,tax_fee:1.5,total_amount:quoteAmount+0.05+1.5 ,total_amount_cus_pay:quoteAmount+0.05+1.5 }
    );

    return res
      .status(200)
      .json({
        status: 200,
        message: "Pro quoted service",
        data: { updateProBookService },
      });
  } catch (e) {
    console.log(e);
    return res.status(400).json({ status: 400, message: e.message });
  }
};

export default updateNewRequestBooking;
