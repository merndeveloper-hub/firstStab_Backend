import axios from "axios";
import getAccessToken from "./accessToken.js";
import Joi from "joi";
import {
  findOne,
  insertNewDocument,
} from "../../../helpers/index.js";
import Stripe from "stripe";
import proTaxJarCal from "../../../lib/taxCollector/proTaxCal.js";

let stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const schema = Joi.object({

  professionalId: Joi.string().required(),
  //  proCategoryId: Joi.string().required(),
  paymentMethod: Joi.string(),

});

const createPaypalOrder = async (req, res) => {
  try {
    await schema.validateAsync(req.body);
    const {

      //  proCategoryId,
      professionalId,

      paymentMethod,

    } = req.body;

    const findProCategory = await findOne("proCategory", {
      proId: professionalId,
      status: { $in: ["Pending", "InActive"] }
    });




    const platform = await findOne("adminFees");

    if (paymentMethod == "paypal") {
      const baseAmount = parseFloat(platform?.registerationFees); // from frontend or DB

      if (isNaN(baseAmount)) {
        throw new Error("Invalid base amount");
      }

      const paypalFeePercentage = parseFloat(platform?.paypalFeePercentage);

      const paypalFixedFee = parseFloat(platform?.paypalFixedFee);



      // Get tax from TaxJar (assumed to be a number)
      const getTaxVal = await proTaxJarCal(professionalId, baseAmount);


      // Calculate PayPal fee and total charge
      const paypalFee = parseFloat(
        (
          baseAmount * paypalFeePercentage +
          paypalFixedFee +
          Number(getTaxVal)
        ).toFixed(2)
      );
      const finalAmount = parseFloat((baseAmount + paypalFee).toFixed(2)); // This is what user pays

      const getToken = await getAccessToken();


      if (!getToken || getToken.length == 0 || getToken.status == 401) {
        return res
          .status(400)
          .json({ status: 400, message: "Paypal Authorization Failed!" });
      }

      const BASE_URL = process.env.PAYPAL_API_DEVELOPMENT_URL;

      const orderData = {
        intent: "CAPTURE",
        purchase_units: [
          {
            amount: {
              currency_code: "USD",
              value: finalAmount.toFixed(2),
              breakdown: {
                item_total: {
                  currency_code: "USD",
                  value: finalAmount.toFixed(2),
                },
              },
            },
            items: [
              {
                name: "Website service",
                description: "Create a website with full functionality",
                unit_amount: {
                  currency_code: "USD",
                  value: finalAmount.toFixed(2),
                },
                quantity: "1",
              },
            ],
          },
        ],
        application_context: {
          return_url: `${process.env.BACKEND_URL}/api/v1/pro/payment/paypalsuccess?professionalId=${professionalId}&subCategorieId=${findProCategory?.subCategories[0]?.id}&proCategory=${findProCategory?._id}`,
          //    return_url: `http://localhost:5000/api/v1/pro/payment/paypalsuccess?professionalId=${professionalId}&subCategorieId=${findProCategory?.subCategories[0]?.id}&proCategory=${findProCategory?._id}`,

          cancel_url:
            `${process.env.BACKEND_URL}/api/v1/pro/payment/paypalcancel`,
          shipping_preference: "NO_SHIPPING",
          user_action: "PAY_NOW",
          brand_name: "firststab",
        },
      };
      const response = await axios.post(
        `${BASE_URL}/v2/checkout/orders`,
        orderData,
        {
          headers: {
            Authorization: `Bearer ${getToken}`,
            "Content-Type": "application/json",
          },
        }
      );



      if (!response || response.length == 0) {
        return res.status(400).json({ status: 400, message: "Try Again!" });
      }

      const data = {
        id: response.data.id,
        status: "CREATED",
        proCategory: findProCategory?._id,
        links: [
          {
            href: response.data.links.find((link) => link.rel === "approve")
              .href,
            rel: "approve",
            method: "GET",
          },
        ],
      };

      const userPayment = await insertNewDocument("payment", {
        ...req.body,
        paymentMethod: "Paypal",
        sender: "Professional",
        baseAmount,
        tax_fee: getTaxVal,
        paypalFixedFee: paypalFixedFee,
        paypalFeePercentage: paypalFeePercentage,

        finalAmount,
        reciever: "Admin",
        type: "Pro_Register_Service",
        paypalOrderId: response.data.id,
        status: "Pending",
      });

      return res.status(201).json({ status: 201, data: data });
    }
    else if (paymentMethod == "stripe") {
      const pro = await findOne("payment", { professionalId, status: 'Pending' });


      if (pro?.stripeAccountId) {
        throw new Error("Stripe onboarding incomplete. Please onboard first.");
      }



      const amountInDollars = parseFloat(platform?.registerationFees);

      const stripeFeePercentage = parseFloat(platform?.stripeFeePercentage);

      const stripeFixedFee = parseFloat(platform?.stripeFixedFee);

      // Get tax from TaxJar (assumed to be a number)
      const getTaxVal = await proTaxJarCal(professionalId, amountInDollars);


      // Example calculation - aapne jaisa fees logic diya tha
      const amountInCents = Math.round(amountInDollars * 100);


      const stripeFeePercent = stripeFeePercentage;


      const fixedFee = stripeFixedFee; // in cents


      let taxAmount = Number(getTaxVal).toFixed(2);


      const totalAmountInCents = Math.ceil(
        (amountInCents + fixedFee + Number(taxAmount)) / (1 - stripeFeePercent)
      );


      const feeAmountInCents = totalAmountInCents - amountInCents;


      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: "usd",
              product_data: {
                name: "My App Payment",
              },
              unit_amount: totalAmountInCents,
            },
            quantity: 1,
          },
        ],
        mode: "payment",
        success_url: `${process.env.BACKEND_URL}/api/v1/pro/payment/stripesuccess?session_id={CHECKOUT_SESSION_ID}&professionalId=${professionalId}&subCategorieId=${findProCategory?.subCategories[0]?.id}&proCategory=${findProCategory?._id}`,
        //  success_url: `http://localhost:5000/api/v1/pro/payment/stripesuccess?session_id={CHECKOUT_SESSION_ID}&professionalId=${professionalId}&subCategorieId=${findProCategory?.subCategories[0]?.id}&proCategory=${findProCategory?._id}`,
        cancel_url: `${process.env.BACKEND_URL}/api/v1/pro/payment/stripecancel?session_id={CHECKOUT_SESSION_ID}`,
        metadata: {
          professionalId: req.body.professionalId,
          netAmount: amountInCents, // user ka original amount (cents)
          stripeFee: feeAmountInCents, // calculated Stripe fees (cents)
          totalAmount: totalAmountInCents, // total charge (cents)
        },
      });



      const data = {
        id: session.id,
        status: "CREATED",
        proCategory: findProCategory?._id,
        links: [
          {
            href: session.url,
            rel: "approve",
            method: "GET",
          },
        ],
      };

      const userPayment = await insertNewDocument("payment", {
        ...req.body,
        paymentMethod: "Stripe",
        sender: "Professional",
        reciever: "Admin",
        type: "Pro_Register_Service",
        stripeSessionId: session.id, // session.id
        stripeSessionUrl: session.url, // session.url
        status: "Pending", // will be 'Success' after webhook confirms
        baseAmount: amountInDollars,
        tax_fee: getTaxVal,
        stripeFixedFee: stripeFixedFee,
        stripeFeePercentage: stripeFeePercentage,
        finalAmount: totalAmountInCents,
      });

      return res.status(201).json({ status: 201, data: data });
    }
  } catch (error) {
    return res.status(400).json({ status: 400, message: error.message });
  }
};

export default createPaypalOrder;
