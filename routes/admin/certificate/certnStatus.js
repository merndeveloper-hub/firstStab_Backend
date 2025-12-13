import Joi from "joi";
import axios from "axios";
import { findOne, updateDocument } from "../../../helpers/index.js";

const schema = Joi.object().keys({
  id: Joi.string().required(),
});

const getCertnStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const url = `${process.env.CERTN_REPORT_STATUS}/${id}`

    const config = {
      method: "get",
      url: url,
      headers: {
        Accept: "application/json",
        Authorization: `Api-Key ${process.env.CERTN_API_KEY}`,
      },
    };

    const response = await axios.request(config);


    const getService = await findOne("proCategory", {
      candidateIdCertn: response?.data?.id,
    });


    let activeService = await updateDocument(
      "proCategory",
      { _id: getService?._id },
      {
        serviceStatus: "pending",
        certnReportStatus: response?.data?.overall_status,
        certnResult: response?.data?.overall_score
      }
    );

    return res.status(200).json({ status: 200, data: response?.data });
  } catch (e) {

    console.log(e);
    return res.status(400).json({ status: 400, message: e.message });
  }
};

export default getCertnStatus;
