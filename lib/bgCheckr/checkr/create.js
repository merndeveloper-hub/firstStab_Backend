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
console.log(getState,"getState");

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
console.log(getState,"getState");
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
    redirect_url: "http://3.110.42.187:5000/api/v1/pro/payment/paypalcancel" // Deep link handled in React Native
  };

  const config = {
    headers: {
      "Content-Type": "application/json",
      Authorization: process.env.CHECKR_CLIENT_SECRET,
    },
  };

  const inviteUrl = process.env.CHECKR_CANDIDATE_INVITAION_DEVELOPMENT_URL;
  const inviteResponse = await axios.post(inviteUrl, inviteData, config);
  console.log(inviteResponse,"invitation----");
  

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
   
    console.log( id,
  bgServiceName,
  bgValidation,
  serviceCountry,
  userCountry,
  proCategoryId,"------------");
    
  await createCandidatesCertn(
        id,
        bgServiceName,
        bgValidation,
        serviceCountry,
        userCountry,
        proCategoryId
      );
    // const { id } = req.params;
    // const {id, bgServiceName, bgValidation, serviceCountry, userCountry } = req.body;

    if (
      bgServiceName !== "checkr" ||
      !["US", "BOTH"].includes(serviceCountry) ||
      !Array.isArray(bgValidation) ||
      bgValidation.length === 0
    ) {
      //return "Invalid input for background check",
      // return res.status(400).json({
      //   status: 400,
      //   message: "Invalid input for background check",
      // });
    }

    const findUser = await findOne("user", { _id: id, userType: "pro" });
    if (!findUser) {
      //  return res.status(404).json({ status: 404, message: "User not found" });
      return "User not found";
    }

    let bgPackage = null;

    const hasCriminal = bgValidation.includes("criminal");
    console.log(hasCriminal,"hascriminal");
    
    const hasCertificate = bgValidation.includes("certificate");
    console.log(hasCertificate,"certofi---");

    if (hasCriminal && hasCertificate && US_COUNTRIES.includes(userCountry)) {
      bgPackage = "basic_criminal_and_plv";
    } else if (hasCriminal && US_COUNTRIES.includes(userCountry)) {
      bgPackage = "basic_plus";
    } else if (hasCertificate && US_COUNTRIES.includes(userCountry)) {
      bgPackage = "plv";
    }
console.log(bgPackage,"bgpakcae-----");

    if (!bgPackage) {
      return "No valid background package found for the given validation.";
      // return res.status(400).json({
      //   status: 400,
      //   message: "No valid background package found for the given validation.",
      // });
    }

    const candidateId = await createCheckrCandidate(findUser, bgPackage);
    const invitationUrl = await sendCheckrInvitation(
      candidateId,
      findUser,
      bgPackage
    );
console.log(invitationUrl,"invitationUrldata");

    // return res.status(200).json({ status: 200, message: invitationUrl });

    const proCategoryupdate = await updateDocument("proCategory",{_id:proCategoryId}, {
      status: "InActive",
      serviceStatus: "pending",
      serviceCountry: serviceCountry,
      bgServiceName: bgServiceName,
      candidateId: candidateId,
      invitationUrl: invitationUrl.invitation_url,
      package: bgPackage,
      bgValidation: bgValidation,
      invitationId:invitationUrl.id,

      workLocation: {
        country: findUser?.country,
        state: findUser?.state,
        city: findUser?.city,
      },
    });
    
  
    
   // const bgData = {invitationUrl,proCategoryupdate};
    return invitationUrl
  } catch (error) {
    console.error(error?.response?.data || error.message);
    return error?.response?.data || error.message;
    // return res.status(400).json({
    //   status: 400,
    //   message: error?.response?.data || error.message,
    // });
  }
};

export default createCandidates;
