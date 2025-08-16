// ES6/7 Import
import Taxjar from 'taxjar';
import { findOne } from '../../helpers/index.js';

// Useful for quick testing
const client = new Taxjar({
  apiKey: '32e489d53cb3949acbe9564af4c2995b',
  apiUrl: 'https://api.sandbox.taxjar.com'
});


const taxJarCal =  async(bookData)  => {
  //const { to_zip, to_state, to_city, to_country,amount } = req.body; // Pro's address

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

  console.log(taxRes,"taxRes");
  
  const tax = taxRes.tax.amount_to_collect.toFixed(2);
 // const totalAmount = (50 + parseFloat(tax)).toFixed(2);
 return tax;
}

export default taxJarCal;
