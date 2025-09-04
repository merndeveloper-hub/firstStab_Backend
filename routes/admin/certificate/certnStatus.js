import Joi from "joi";
import axios from "axios";
import { findOne, updateDocument } from "../../../helpers/index.js";

const schema = Joi.object().keys({
  id: Joi.string().required(),
});

const getCertnStatus = async (req, res) => {
  try {
    const { id } = req.params;
   // const url = `${process.env.CHECKR_CANDIDATE_INVITAION_DEVELOPMENT_URL}/${id}`;

    const config = {
      method: "get",
      url: `https://api.sandbox.certn.co/api/public/cases/${id}/`,
      headers: {
        Accept: "application/json",
        Authorization: "Api-Key iRjjZui7.2UvUN6I4TtUweWT7wxL3BmEFRx5TZVRe",
      },
    };

    const response = await axios.request(config);
    console.log(response?.data, "response");

    // const oneIdUrl = response.data?.input_claims?.one_id_url;

    const getService = await findOne("proCategory", {
      candidateIdCertn: response?.data?.id,
    });
    console.log(getService, "getservice");
    //     let activeService;

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
    // return response?.data?.id;
    console.log(e);
    return res.status(400).json({ status: 400, message: e.message });
  }
};

export default getCertnStatus;
