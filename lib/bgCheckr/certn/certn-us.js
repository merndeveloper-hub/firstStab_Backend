import axios from "axios";
import { findOne, updateDocument } from "../../../helpers/index.js";

// Delay helper
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Create Certn candidate (aka "order a case")
const createCertnCase = async (findUser) => {
  const data = {
    email_address: findUser.email,
    send_invite_email: false,
    check_types_with_arguments: {
      IDENTITY_VERIFICATION_1: {},
    },
    message: "One ID Quick Screen Check",
    input_claims: {
      one_id_2_demo_response: "LIVE_ONE_ID_URL_OVERRIDE",
      are_consents_and_disclosures_accepted: true,
      is_general_authorization_accepted: true,
      is_biometric_consent_accepted: true,
      name: {
        given_name: findUser.firstName || "David",
        family_name: findUser.lastName || "Miller",
        additional_name: "",
        type: "LEGAL",
      },
      date_of_birth: findUser.dob || "1995-01-01",
      position_location: {
        country: "CA",
        type: "REMOTE",
      },
      residences: [
        {
          address: {
            street_address: findUser.street || "2121 Brightoncrest Green SE",
            locality: findUser.city || "Calgary",
            country: "CA",
            postal_code: findUser.zip || "T2Z 5A4",
          },
          start_date: "2022-05-01",
          end_date: null,
        },
      ],
    },
  };

  const config = {
    method: "post",
    url: "https://api.sandbox.certn.co/api/public/cases/order/",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: "Api-Key iRjjZui7.2UvUN6I4TtUweWT7wxL3BmEFRx5TZVRe",
    },
    data: JSON.stringify(data),
  };

  const res = await axios.request(config);
  return res.data?.id;
};

// Fetch case details and wait for `one_id_url`
const fetchCertnCaseDetails = async (caseId, retries = 5, delayMs = 2000) => {
  const config = {
    method: "get",
    url: `https://api.sandbox.certn.co/api/public/cases/${caseId}/`,
    headers: {
      Accept: "application/json",
      Authorization: "Api-Key iRjjZui7.2UvUN6I4TtUweWT7wxL3BmEFRx5TZVRe",
    },
  };

  for (let i = 0; i < retries; i++) {
    const response = await axios.request(config);
    const oneIdUrl = response.data?.input_claims?.one_id_url;

    if (oneIdUrl) {
      return {
        invitationId: response.data?.id,
        invitationUrl: oneIdUrl,
      };
    }

    await delay(delayMs);
  }

  throw new Error("Failed to retrieve one_id_url after retries");
};

// Main function
const createCandidates = async (
  id,
  bgServiceName,
  bgValidation,
  serviceCountry,
  userCountry,
  proCategoryId
) => {
  try {
    const findUser = await findOne("user", { _id: id, userType: "pro" });
    if (!findUser) return "User not found";

    const candidateId = await createCertnCase(findUser);
    console.log("✅ Candidate ID:", candidateId);

    const { invitationUrl, invitationId } = await fetchCertnCaseDetails(candidateId);
    console.log("✅ Invitation URL:", invitationUrl);

    const proCategoryUpdate = await updateDocument("proCategory", { _id: proCategoryId }, {
      status: "InActive",
      serviceStatus: "pending",
      serviceCountry,
      bgServiceName,
      candidateIdCertn:candidateId,
      invitationUrlCertn:invitationUrl,
      packageCertn: "oneIdVERIFICATION",
      bgValidation,
      invitationIdCertn:invitationId,
      workLocation: {
        country: findUser?.country,
        state: findUser?.state,
        city: findUser?.city,
      },
    });

   
  } catch (error) {
    console.error("❌ Error:", error?.response?.data || error.message);
    return error?.response?.data || error.message;
  }
};

export default createCandidates;
