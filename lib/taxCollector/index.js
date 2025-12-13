// ES6/7 Import
import Taxjar from 'taxjar';
import { findOne } from '../../helpers/index.js';

// Useful for quick testing
const client = new Taxjar({
  apiKey: process.env.TAXJAR_KEY_DEV || '0ab22b044a0a0c1a5a48cd95b5225222',
  apiUrl: process.env.TAXJAR_URL_DEV || 'https://api.sandbox.taxjar.com',
});




const taxJarCal =  async(bookData)  => {
  

  // Step 1: Calculate tax with TaxJar
  let userData = findOne('user',{_id:bookData?.user})
 let proData = findOne('user',{_id:bookData?.pro})


  const taxRes = await client.taxForOrder({
  
     from_country:proData?.country || 'US',
  from_zip:proData?.zipCode || '07001',
  from_state: proData?.state ||'NJ',
  to_country: userData?.country || 'US',
  to_zip: userData?.zipCode ||'07446',
  to_state: userData?.state ||'NJ',
  amount:  bookData?.totalAmt,
  shipping: 0,
  line_items: [
    {
      quantity: 1,
      unit_price: bookData?.totalAmt ,
      product_tax_code: '81162000'
    }
  ],
  });

 
  
  const tax = taxRes.tax.amount_to_collect.toFixed(2);
 // const totalAmount = (50 + parseFloat(tax)).toFixed(2);
 return tax;
}

export default taxJarCal;
