// ES6/7 Import
import Taxjar from 'taxjar';
import { findOne } from '../../helpers/index.js';

const client = new Taxjar({
  apiKey: process.env.TAXJAR_KEY_DEV || '0ab22b044a0a0c1a5a48cd95b5225222',
  apiUrl: process.env.TAXJAR_URL_DEV || 'https://api.sandbox.taxjar.com',
});



const proTaxJarCal = async (id, amount) => {




  let proData = findOne('user', { _id: id })


  const taxRes = await client.taxForOrder({

    from_country: proData?.country || 'US',
    from_zip: proData?.zipCode || '07001',
    from_state: proData?.state || 'NJ',
    to_country: 'US', //admin
    to_zip: '07446',//admin
    to_state: 'NJ',//admin
    amount: amount,
    shipping: 0,
    line_items: [
      {
        quantity: 1,
        unit_price: amount,
        product_tax_code: '81162000'
      }
    ],
  });



  const tax = taxRes.tax.amount_to_collect.toFixed(2);

  return tax;
}

export default proTaxJarCal;
