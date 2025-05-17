// import axios from "axios";
// import { findOne } from "../../../helpers/index.js";

// const createCandidates = async (req, res) => {

//   try {
//     const { id } = req.params;
//     const { bgServiceName, bgValidation, serviceCountry, userCountry } = req.body;
//     console.log(req.body, "body");
//     //  "bgServiceName":"checkr",
//     //     "bgValidation":"['criminal','certificate']",
//     //     "serviceCountry":"US",
//     //     "userCountry":"American Samoa"
//        const US_COUNTRIES = [
//         "United States",
//         "American Samoa",
//         "Guam",
//         "Northern Mariana Islands",
//         "Puerto Rico",
//         "U.S. Virgin Islands",
//         "United States Minor Outlying Islands",
//       ];
//       US_COUNTRIES.includes(userCountry)

//     if (
//       US_COUNTRIES &&
//       bgServiceName === "checkr" &&
//       (serviceCountry === "US" || serviceCountry === "BOTH") && (bgValidation[0] == 'criminal' && bgValidation[1] == 'certificate')
//     ) {
//       console.log("if");

//       const findUser = await findOne("user", { _id: id, userType: "pro" });

//       const data = {
//         first_name: findUser?.first_Name,
//         last_name: findUser?.last_Name,
//         email: findUser?.email,
//         middle_name: "",
//         work_locations: [
//           {
//             country: findUser?.country,
//             state: findUser?.state,
//             city: findUser?.city,
//           },
//         ],
//       };

//       const config = {
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: process.env.CHECKR_CLIENT_SECRET,
//         },
//       };

//       //const url = 'https://api.checkr-staging.com/v1/candidates/';
//       const url = process.env.CHECKR_CANDIDATE_DEVELOPMENT_URL;
//       const response = await axios.post(url, data, config);

//       if (!response) {
//         return res
//           .status(400)
//           .json({
//             status: 400,
//             message: error.response?.data || "No candidate found",
//           });
//       }

//       const inviteData = {
//         candidate_id: response?.data.id,
//         work_locations: [
//           {
//             // country: 'US',
//             // state: 'CA',
//             // city: 'San Jose'
//             country: findUser?.country,
//             state: findUser?.state,
//             city: findUser?.city,
//           },
//         ],
//         package: "basic_criminal_and_plv",
//         // package:response?.package
//       };

//       const inviteconfig = {
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: process.env.CHECKR_CLIENT_SECRET,
//         },
//       };

//       //   const inviteurl = 'https://api.checkr-staging.com/v1/invitations';
//       const inviteurl = process.env.CHECKR_CANDIDATE_INVITAION_DEVELOPMENT_URL;
//       const inviteresponse = await axios.post(
//         inviteurl,
//         inviteData,
//         inviteconfig
//       );

//       console.log(inviteresponse.data, "response");

//       // if(!inviteresponse || inviteresponse.data.status == 'pending'){
//       // return res.status(400).json({ status: 400, message: error.inviteresponse?.data || 'Service background verification still pending' });
//       // }

//       if (!inviteresponse) {
//         return res
//           .status(400)
//           .json({
//             status: 400,
//             message:
//               error.inviteresponse?.data ||
//               "Service background verification still pending",
//           });
//       }

//       return res
//         .status(200)
//         .json({ status: 200, message: inviteresponse.data.invitation_url });
//     }
//     else if (
//        bgServiceName === "checkr" &&
//       (serviceCountry === "US" || serviceCountry === "BOTH") && (bgValidation[0] == 'criminal')
//     ) {

//       console.log("basic plus");

//       const findUser = await findOne("user", { _id: id, userType: "pro" });
//       console.log(findUser, "finsuser");

//       const data = {
//         first_name: findUser?.first_Name,
//         last_name: findUser?.last_Name,
//         email: findUser?.email,
//         middle_name: "",
//         work_locations: [
//           {
//             country: findUser?.country,
//             state: findUser?.state,
//             city: findUser?.city,
//           },
//         ],
//       };

//       const config = {
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: process.env.CHECKR_CLIENT_SECRET,
//         },
//       };

//       //const url = 'https://api.checkr-staging.com/v1/candidates/';
//       const url = process.env.CHECKR_CANDIDATE_DEVELOPMENT_URL;
//       const response = await axios.post(url, data, config);

//       console.log(response.data, "response");
//       if (!response) {
//         return res
//           .status(400)
//           .json({
//             status: 400,
//             message: error.response?.data || "No candidate found",
//           });
//       }
//       console.log(response, "response----");

//       const inviteData = {
//         candidate_id: response?.data.id,
//         work_locations: [
//           {
//             // country: 'US',
//             // state: 'CA',
//             // city: 'San Jose'
//             country: findUser?.country,
//             state: findUser?.state,
//             city: findUser?.city,
//           },
//         ],
//         package: "basic_plus",
//         // package:response?.package
//       };

//       const inviteconfig = {
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: process.env.CHECKR_CLIENT_SECRET,
//         },
//       };

//       //   const inviteurl = 'https://api.checkr-staging.com/v1/invitations';
//       const inviteurl = process.env.CHECKR_CANDIDATE_INVITAION_DEVELOPMENT_URL;
//       const inviteresponse = await axios.post(
//         inviteurl,
//         inviteData,
//         inviteconfig
//       );

//       console.log(inviteresponse.data, "response");

//       // if(!inviteresponse || inviteresponse.data.status == 'pending'){
//       // return res.status(400).json({ status: 400, message: error.inviteresponse?.data || 'Service background verification still pending' });
//       // }

//       if (!inviteresponse) {
//         return res
//           .status(400)
//           .json({
//             status: 400,
//             message:
//               error.inviteresponse?.data ||
//               "Service background verification still pending",
//           });
//       }

//       return res
//         .status(200)
//         .json({ status: 200, message: inviteresponse.data.invitation_url });
//     }
//      else if (
//        bgServiceName === "checkr" &&
//       (serviceCountry === "US" || serviceCountry === "BOTH") && (bgValidation[0] == 'certificate')
//     ) {

//       console.log("plv");

//       const findUser = await findOne("user", { _id: id, userType: "pro" });
//       console.log(findUser, "finsuser");

//       const data = {
//         first_name: findUser?.first_Name,
//         last_name: findUser?.last_Name,
//         email: findUser?.email,
//         middle_name: "",
//         work_locations: [
//           {
//             country: findUser?.country,
//             state: findUser?.state,
//             city: findUser?.city,
//           },
//         ],
//       };

//       const config = {
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: process.env.CHECKR_CLIENT_SECRET,
//         },
//       };

//       //const url = 'https://api.checkr-staging.com/v1/candidates/';
//       const url = process.env.CHECKR_CANDIDATE_DEVELOPMENT_URL;
//       const response = await axios.post(url, data, config);

//       console.log(response.data, "response");
//       if (!response) {
//         return res
//           .status(400)
//           .json({
//             status: 400,
//             message: error.response?.data || "No candidate found",
//           });
//       }
//       console.log(response, "response----");

//       const inviteData = {
//         candidate_id: response?.data.id,
//         work_locations: [
//           {
//             // country: 'US',
//             // state: 'CA',
//             // city: 'San Jose'
//             country: findUser?.country,
//             state: findUser?.state,
//             city: findUser?.city,
//           },
//         ],
//         package: "plv",
//         // package:response?.package
//       };

//       const inviteconfig = {
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: process.env.CHECKR_CLIENT_SECRET,
//         },
//       };

//       //   const inviteurl = 'https://api.checkr-staging.com/v1/invitations';
//       const inviteurl = process.env.CHECKR_CANDIDATE_INVITAION_DEVELOPMENT_URL;
//       const inviteresponse = await axios.post(
//         inviteurl,
//         inviteData,
//         inviteconfig
//       );

//       console.log(inviteresponse.data, "response");

//       // if(!inviteresponse || inviteresponse.data.status == 'pending'){
//       // return res.status(400).json({ status: 400, message: error.inviteresponse?.data || 'Service background verification still pending' });
//       // }

//       if (!inviteresponse) {
//         return res
//           .status(400)
//           .json({
//             status: 400,
//             message:
//               error.inviteresponse?.data ||
//               "Service background verification still pending",
//           });
//       }

//       return res
//         .status(200)
//         .json({ status: 200, message: inviteresponse.data.invitation_url });
//     }
//   } catch (error) {
//     console.log(error.response?.data || error.message, "error");
//     return res
//       .status(400)
//       .json({ status: 400, message: error.response?.data || error.message });
//   }
// };

// export default createCandidates;

import axios from "axios";
import { findOne, updateDocument } from "../../../helpers/index.js";

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
 

  const data = {
    first_name: findUser?.first_Name,
    last_name: findUser?.last_Name,
    email: findUser?.email,
    middle_name: "",
    work_locations: [
      {
        country: "US",
        state: findUser?.state,
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
  const inviteData = {
    candidate_id,
    work_locations: [
      {
        country: "US",
        state: findUser?.state,
        city: findUser?.city,
      },
    ],
    package: bgPackage,
  };

  const config = {
    headers: {
      "Content-Type": "application/json",
      Authorization: process.env.CHECKR_CLIENT_SECRET,
    },
  };

  const inviteUrl = process.env.CHECKR_CANDIDATE_INVITAION_DEVELOPMENT_URL;
  const inviteResponse = await axios.post(inviteUrl, inviteData, config);
  

  return inviteResponse?.data?.invitation_url;
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

    // return res.status(200).json({ status: 200, message: invitationUrl });

    const proCategoryupdate = await updateDocument("proCategory",{_id:proCategoryId}, {
      status: "InActive",
      serviceStatus: "pending",
      serviceCountry: serviceCountry,
      bgServiceName: bgServiceName,
      candidateId: candidateId,
      invitationUrl: invitationUrl,
      package: bgPackage,
      bgValidation: bgValidation,

      workLocation: {
        country: findUser?.country,
        state: findUser?.state,
        city: findUser?.city,
      },
    });
    
  
    
    const bgData = {invitationUrl,proCategoryupdate};
    return bgData
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
