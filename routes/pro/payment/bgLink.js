import { findOne } from "../../../helpers/index.js";

const getbgLink = async (req, res) => {
  try {
    const { id } = req.params;

    // const getPayment = await findOne(
    //   "payment",
    //   {professionalId:id,status:"COMPLETED"},

    // );

    // if (!getPayment || getPayment.length === 0) {
    //   return res.status(400).send({
    //     status: 400,
    //     message: "Pay your register payment",
    //   });
    // }

    const getURL = await findOne("proCategory", { _id: id });
    console.log(getURL, "url-----");


    if(!getURL){
       return res.status(400).json({ status: 400, message: "Kindly check you email" });
    }
    
 const US_COUNTRIES = [
      "United States",
      "American Samoa",
      "Guam",
      "Northern Mariana Islands",
      "Puerto Rico",
      "U.S. Virgin Islands",
      "United States Minor Outlying Islands",
    ];

    // add bg code
    const findPro = await findOne("user", {
      _id: getURL?.proId,
      userType: "pro",
    });
    let getCountry = US_COUNTRIES.includes(findPro?.country);
    console.log(getCountry, "getcouintry");


    let url = getURL?.invitationUrl;

  let certnURL=getURL?.invitationUrlCertn


  let decideCountry = getCountry == true? "US":"Non-US" 
    return res.status(200).json({ status: 200, data: { url,certnURL,decideCountry } });

  } catch (e) {
    console.log(e);
    return res.status(400).json({ status: 400, message: e.message });
  }
};

export default getbgLink;
