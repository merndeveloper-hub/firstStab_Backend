import { findOne } from "../../../helpers/index.js";

const getbgLink = async (req, res) => {
  try {
    const { id, register } = req.params;




    // jb register tru hoga toh pro ke id jye ge,jb login kr ke a rha hoga tb proCategory ke id jye ge.
    if (register == "true") {


      const getURL = await findOne("proCategory", { proId: id });


      if (!getURL) {
        return res
          .status(400)
          .json({ status: 400, message: "Kindly check you email" });
      }

      const US_COUNTRIES = [
        "United States",
        "American Samoa",
        "Guam",
        "Northern Mariana Islands",
        "Puerto Rico",
        "U.S. Virgin Islands",
        "United States Minor Outlying Islands",
      ];

      // add bg code
      const findPro = await findOne("user", {
        _id: getURL?.proId,
        userType: "pro",
      });
      let getCountry = US_COUNTRIES.includes(findPro?.country);


      let url = getURL?.invitationUrl;

      let certnURL = getURL?.invitationUrlCertn;

      let decideCountry = getCountry == true ? "US" : "Non-US";
      return res
        .status(200)
        .json({ status: 200, data: { url, certnURL, decideCountry } });
    } else {
      const getURL = await findOne("proCategory", { _id: id });


      if (!getURL) {
        return res
          .status(400)
          .json({ status: 400, message: "Kindly check you email" });
      }

      const US_COUNTRIES = [
        "United States",
        "American Samoa",
        "Guam",
        "Northern Mariana Islands",
        "Puerto Rico",
        "U.S. Virgin Islands",
        "United States Minor Outlying Islands",
      ];

      // add bg code
      const findPro = await findOne("user", {
        _id: getURL?.proId,
        userType: "pro",
      });
      let getCountry = US_COUNTRIES.includes(findPro?.country);


      let url = getURL?.invitationUrl;

      let certnURL = getURL?.invitationUrlCertn;

      let decideCountry = getCountry == true ? "US" : "Non-US";
      return res
        .status(200)
        .json({ status: 200, data: { url, certnURL, decideCountry } });
    }
  } catch (e) {
    console.log(e);
    return res.status(400).json({ status: 400, message: e.message });
  }
};

export default getbgLink;
