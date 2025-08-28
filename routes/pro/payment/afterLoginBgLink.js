import { find } from "../../../helpers/index.js";

const afterLoginBgLink = async (req, res) => {
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

    // is mein payment bhe check krni hain yeh km is se phele hoga pending hain kr lena


    const getProService = await find("proCategory", { proId: id,status:"Pending" });
    console.log(getURL, "url-----");


//     if(!getURL){
//        return res.status(400).json({ status: 400, message: "Kindly check you email" });
//     }
    
//  const US_COUNTRIES = [
//       "United States",
//       "American Samoa",
//       "Guam",
//       "Northern Mariana Islands",
//       "Puerto Rico",
//       "U.S. Virgin Islands",
//       "United States Minor Outlying Islands",
//     ];

//     // add bg code
//     const findPro = await findOne("user", {
//       _id: id,
//       userType: "pro",
//     });
//     let getCountry = US_COUNTRIES.includes(findPro?.country);
//     console.log(getCountry, "getcouintry");


//     let url = getURL[1]?.invitationUrl;

//   let certnURL=getURL[1]?.invitationUrlCertn


//   let decideCountry = getCountry == true? "US":"Non-US" 
    return res.status(200).json({ status: 200, getProService });

  } catch (e) {
    console.log(e);
    return res.status(400).json({ status: 400, message: e.message });
  }
};

export default afterLoginBgLink;
