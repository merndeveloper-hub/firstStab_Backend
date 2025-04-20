// import Joi from "joi";
// import { find, getAggregate } from "../../../helpers/index.js";

// const schema = Joi.object().keys({
//   id: Joi.string().required(),
// });


// const historyBooking = async (req, res) => {
//   try {
//     await schema.validateAsync(req.params);
//     const { id } = req.params;
// const historybook = await find("booking",{userId:id,serviceStatus:"Cancelled"|| "Approved" || "completed"})

// if(historybook.length <= 0){
//   return res.status(200).json({ status: 200, message: "No History Booking Found!" });
// }
// console.log(historybook,"historybook");



    
//     return res.status(200).json({ status: 200, historybook });
//   } catch (e) {
//     console.log(e);
//     return res.status(500).json({ status: 500, message: e.message });
//   }
// };

// export default historyBooking;


