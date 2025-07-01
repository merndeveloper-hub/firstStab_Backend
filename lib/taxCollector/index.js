// ES6/7 Import
import Taxjar from 'taxjar';

// Useful for quick testing
const client = new Taxjar({
  apiKey: 'b53086852c0bbcca9771fe10e79d5a3e',
  apiUrl: 'https://api.sandbox.taxjar.com'
});


const taxJarCal =  async()  => {
  //const { to_zip, to_state, to_city, to_country,amount } = req.body; // Pro's address

  // Step 1: Calculate tax with TaxJar
  const taxRes = await client.taxForOrder({
    // from_country: 'US',
    // from_zip: '94111',
    // from_state: 'CA',
    // to_country,
    // to_zip,
    // to_state,
    // to_city,
    // amount: 50,
    // shipping: 0,
    // line_items: [
    //   {
    //     id: 'reg-fee',
    //     quantity: 1,
    //     unit_price: 50,
    //     product_tax_code: '81162000', // For professional service
    //   },
    // ],
     from_country: 'US',
  from_zip: '07001',
  from_state: 'NJ',
  to_country: 'US',
  to_zip: '07446',
  to_state: 'NJ',
  amount: 4,
  shipping: 0,
  line_items: [
    {
      quantity: 1,
      unit_price: 4,
      product_tax_code: '31000'
    }
  ],
  });

  console.log(taxRes,"taxRes");
  
  const tax = taxRes.tax.amount_to_collect.toFixed(2);
 // const totalAmount = (50 + parseFloat(tax)).toFixed(2);
 return tax;
}

export default taxJarCal;
//   // Step 2: Create PayPal Order
//   const request = new paypal.orders.OrdersCreateRequest();
//   request.prefer("return=representation");
//   request.requestBody({
//     intent: "CAPTURE",
//     purchase_units: [
//       {
//         amount: {
//           currency_code: "USD",
//           value: totalAmount,
//           breakdown: {
//             item_total: { currency_code: "USD", value: "50.00" },
//             tax_total: { currency_code: "USD", value: tax },
//           },
//         },
//         items: [
//           {
//             name: "Pro Registration Fee",
//             unit_amount: { currency_code: "USD", value: "50.00" },
//             tax: { currency_code: "USD", value: tax },
//             quantity: "1",
//           },
//         ],
//       },
//     ],
//     application_context: {
//       return_url: "https://yourapp.com/paypal-success",
//       cancel_url: "https://yourapp.com/paypal-cancel",
//     },
//   });

//   const order = await client.execute(request);
//   res.json({ id: order.result.id });
// }
