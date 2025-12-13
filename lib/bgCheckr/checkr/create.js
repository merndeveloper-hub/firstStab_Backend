import axios from "axios";
import { findOne, updateDocument } from "../../../helpers/index.js";
import createCandidatesCertn from "../certn/certn-us.js";
import usStates from "./stateMapping.js";
const US_COUNTRIES = [
  "United States",
  "American Samoa",
  "Guam",
  "Northern Mariana Islands",
  "Puerto Rico",
  "U.S. Virgin Islands",
  "United States Minor Outlying Islands",
];

const createCheckrCandidate = async (findUser, bgPackage) => {


  let getState = usStates[findUser?.state]


  const data = {
    first_name: findUser?.first_Name,
    last_name: findUser?.last_Name,
    email: findUser?.email,
    middle_name: "",
    work_locations: [
      {
        country: "US",
        state: getState?.code,
        city: findUser?.city,
      },
    ],
  };

  const config = {
    headers: {
      "Content-Type": "application/json",
      Authorization: process.env.CHECKR_CLIENT_SECRET,
    },
  };

  const url = process.env.CHECKR_CANDIDATE_DEVELOPMENT_URL;
  const response = await axios.post(url, data, config);


  return response?.data?.id;
};

const sendCheckrInvitation = async (candidate_id, findUser, bgPackage) => {
  let getState = usStates[findUser?.state]

  const inviteData = {
    candidate_id,
    work_locations: [
      {
        country: "US",
        state: getState?.code,
        city: findUser?.city,
      },
    ],
    package: bgPackage,
    // ✅ Add redirect_url here (use success or a neutral page in app)
    redirect_url: `${process.env.BACKEND_URL}/api/v1/pro/payment/paypalcancel` // Deep link handled in React Native
  };

  const config = {
    headers: {
      "Content-Type": "application/json",
      Authorization: process.env.CHECKR_CLIENT_SECRET,
    },
  };

  const inviteUrl = process.env.CHECKR_CANDIDATE_INVITAION_DEVELOPMENT_URL;
  const inviteResponse = await axios.post(inviteUrl, inviteData, config);



  return inviteResponse?.data;
};

const createCandidates = async (
  id,
  bgServiceName,
  bgValidation,
  serviceCountry,
  userCountry,
  proCategoryId
) => {
  try {



    await createCandidatesCertn(
      id,
      bgServiceName,
      bgValidation,
      serviceCountry,
      userCountry,
      proCategoryId
    );


    if (
      bgServiceName !== "checkr" ||
      !["US", "BOTH"].includes(serviceCountry) ||
      !Array.isArray(bgValidation) ||
      bgValidation.length === 0
    ) {

    }

    const findUser = await findOne("user", { _id: id, userType: "pro" });
    if (!findUser) {

      return "User not found";
    }

    let bgPackage = null;

    const hasCriminal = bgValidation.includes("criminal");


    const hasCertificate = bgValidation.includes("certificate");


    if (hasCriminal && hasCertificate && US_COUNTRIES.includes(userCountry)) {
      bgPackage = "basic_criminal_and_plv";
    } else if (hasCriminal && US_COUNTRIES.includes(userCountry)) {
      bgPackage = "basic_plus";
    } else if (hasCertificate && US_COUNTRIES.includes(userCountry)) {
      bgPackage = "plv";
    }


    if (!bgPackage) {
      return "No valid background package found for the given validation.";

    }

    const candidateId = await createCheckrCandidate(findUser, bgPackage);
    const invitationUrl = await sendCheckrInvitation(
      candidateId,
      findUser,
      bgPackage
    );




    const proCategoryupdate = await updateDocument("proCategory", { _id: proCategoryId }, {
      // status: "InActive",
      status: 'Active',
      serviceStatus: "invited",
      serviceCountry: serviceCountry,
      bgServiceName: bgServiceName,
      candidateId: candidateId,
      invitationUrl: invitationUrl?.invitation_url,
      package: bgPackage,
      bgValidation: bgValidation,
      invitationId: invitationUrl?.id,

      workLocation: {
        country: findUser?.country,
        state: findUser?.state,
        city: findUser?.city,
      },
    });

    return invitationUrl
  } catch (error) {
    console.error(error?.response?.data || error.message);
    return error?.response?.data || error.message;
  }
};

export default createCandidates;
