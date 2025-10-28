// ES6/7 Import
import Taxjar from 'taxjar';
import { findOne } from '../../helpers/index.js';

// Useful for quick testing
const client = new Taxjar({
  apiKey: 'fd148019382a1ee06f446741f7d15120',
  apiUrl: 'https://api.sandbox.taxjar.com',
  //apiKey:process.env.TAXJAR_KEY,
  //apiUrl:process.env.TAXJAR_URL
});


console.log(client,"clinet");
console.log(process.env.TAXJAR_KEY,"process.env.TAXJAR_KEY");
console.log(process.env.TAXJAR_URL,"process.env.TAXJAR_URL");
const proTaxJarCal =  async(id,amount)  => {
  //const { to_zip, to_state, to_city, to_country,amount } = req.body; // Pro's address

 console.log(id,amount,"amount------");
 
 let proData = findOne('user',{_id:id})


  const taxRes = await client.taxForOrder({
  
     from_country:proData?.country || 'US',
  from_zip:proData?.zipCode || '07001',
  from_state: proData?.state ||'NJ',
  to_country:  'US', //admin
  to_zip: '07446',//admin
  to_state:'NJ',//admin
  amount:  amount,
  shipping: 0,
  line_items: [
    {
      quantity: 1,
      unit_price: amount ,
      product_tax_code: '81162000'
    }
  ],
  });

  console.log(taxRes,"taxRes");
  
  const tax = taxRes.tax.amount_to_collect.toFixed(2) ;
 // const totalAmount = (50 + parseFloat(tax)).toFixed(2);
 return tax;
}

export default proTaxJarCal;
