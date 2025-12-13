import Joi from "joi";
import axios from "axios";
import { findOne, updateDocument } from "../../../helpers/index.js";

const schema = Joi.object().keys({
  id: Joi.string().required(),
});

const getInvitationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const url = `${process.env.CHECKR_CANDIDATE_INVITAION_DEVELOPMENT_URL}/${id}`;


    const config = {
      headers: {
        "Content-Type": "application/json",
        Authorization:
          `Basic ${process.env.CHECKR_CLIENT_SECRET}`,
      },

    };


    const response = await axios.get(url, config);


    if (response?.data?.report_id) {


      const url = `${process.env.CHECKR_REPORT_URL}/${response?.data?.report_id}?include=candidate,ssn_trace,county_criminal_searches,motor_vehicle_report`;

      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization:
            `Basic ${process.env.CHECKR_CLIENT_SECRET}`,
        },
        data: {},
      };

      const reportRes = await axios.get(url, config);


      const getService = await findOne("proCategory", {
        invitationId: response?.data?.id,
      });


      let activeService = await updateDocument(
        "proCategory",
        { _id: getService?._id },
        {
          serviceStatus: "pending",
          checkrReportStatus: reportRes?.data?.status,
          checkrResult: reportRes?.data?.result
        }
      );

      return res.status(200).json({ status: 200, data: reportRes?.data });
    }

    const getService = await findOne("proCategory", {
      invitationId: response?.data?.id,
    });

    let activeService;
    if (getService) {
      activeService = await updateDocument(
        "proCategory",
        { _id: getService?._id },
        {
          serviceStatus: response?.data?.status,
          checkrReportStatus: response?.data?.report_id,
        }
      );
    }
    return res.status(200).json({ status: 200, data: activeService });
    // return response?.data?.id;
  } catch (e) {
    console.log(e);
    return res.status(400).json({ status: 400, message: e.message });
  }
};

export default getInvitationStatus;
