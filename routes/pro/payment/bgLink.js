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

    let url = getURL?.invitationUrl;

    if(!url || url.length == 0){
       return res.status(400).json({ status: 400, message: "Kindly check you email" });
    }
    return res.status(200).json({ status: 200, data: { url } });

  } catch (e) {
    console.log(e);
    return res.status(400).json({ status: 400, message: e.message });
  }
};

export default getbgLink;
