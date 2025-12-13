import Joi from "joi";
import { findOne, updateDocument } from "../../../helpers/index.js";
import taxJarCal from "../../../lib/taxCollector/index.js";


const schema = Joi.object().keys({
  id: Joi.string().required(),
});

const schemaBody = Joi.object().keys({
  quoteAmount: Joi.number(),
  quoteInfo: Joi.string().allow(null, ""),
  quoteDetail: Joi.string().allow(null, ""),
  paypal_fee: Joi.string(),
  service_fee: Joi.string(),
  tax_fee: Joi.string(),
  total_amount: Joi.string(),
  total_amount_cus_pay: Joi.string(),
});

const updateNewRequestBooking = async (req, res) => {
  try {
    await schema.validateAsync(req.params);
    await schemaBody.validateAsync(req.body);
    const { id } = req.params;
    const {
      quoteAmount,
      quoteInfo,
      quoteDetail,
      paypal_fee,
      service_fee,
      tax_fee,
      total_amount,
      total_amount_cus_pay,
    } = req.body;

    const proBookService = await findOne("proBookingService", { _id: id });

    if (!proBookService || proBookService.length == 0) {
      return res
        .status(400)
        .json({ status: 400, message: "Does not exist new booking service!" });
    }



    const platform = await findOne("adminFees");
    const dbPlatformFee = parseFloat(platform?.platformFees); // e.g., 15

    const serviceAmount = parseFloat(
      proBookService?.quoteAmount || proBookService?.fixed_price || quoteAmount
    );

    const platformFeePercent = dbPlatformFee || 20; // default 20% if not set in DB
    const platformCharges = (serviceAmount * platformFeePercent) / 100;

    const totalTaxJarAmt = serviceAmount + platformCharges;



    // // PayPal fee calculation
    // const feePercentage = 3.49 / 100;
    // const fixedFee = 0.49;

    // Get tax from TaxJar (assumed to be a number)

    let bookData = {
      user: proBookService?.professsionalId,
      totalAmt: Number(totalTaxJarAmt),
    };
    //3)tax jar amount
    const getTaxVal = await taxJarCal(bookData);





    const findUserBookService = await findOne("userBookServ", {
      _id: proBookService.bookServiceId,
    });


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
    let totalAmount =
      Number(serviceAmount) + Number(platformCharges) + Number(getTaxVal);
    if (proBookService?.quoteAmount) {
      const updateProBookService = await updateDocument(
        "proBookingService",
        { _id: id },
        {
          status: "Accepted",
          service_fee: serviceAmount,
          platformFees: platformCharges,
          //  paypalFixedFee: paypalFixedFee,
          //  paypalFeePercentage: paypalFeePercentage,
          tax_fee: getTaxVal,
          total_amount: Number(totalAmount),
          total_amount_cus_pay: Number(totalAmount),
        }
      );
      return res.status(200).json({
        status: 200,
        message: "Pro quoted service",
        data: { updateProBookService },
      });
    } else if (proBookService?.fixed_price) {
      const updateProBookService = await updateDocument(
        "proBookingService",
        { _id: id },
        {
          status: "Accepted",
          service_fee: serviceAmount,
          platformFees: platformCharges,
          // paypalFixedFee: paypalFixedFee,
          // paypalFeePercentage: paypalFeePercentage,
          tax_fee: getTaxVal,
          total_amount: Number(totalAmount),
          total_amount_cus_pay: Number(totalAmount),
        }
      );
      return res.status(200).json({
        status: 200,
        message: "Pro quoted service",
        data: { updateProBookService },
      });
    } else if (quoteAmount) {
      const updateProBookService = await updateDocument(
        "proBookingService",
        { _id: id },
        {
          status: "Accepted",
          service_fee: serviceAmount,
          platformFees: platformCharges,
          // paypalFixedFee: paypalFixedFee,
          // paypalFeePercentage: paypalFeePercentage,
          tax_fee: getTaxVal,
          total_amount: Number(totalAmount),
          total_amount_cus_pay: Number(totalAmount),
        }
      );
      return res.status(200).json({
        status: 200,
        message: "Pro quoted service",
        data: { updateProBookService },
      });
    }


  } catch (e) {
    console.log(e);
    return res.status(400).json({ status: 400, message: e.message });
  }
};

export default updateNewRequestBooking;
