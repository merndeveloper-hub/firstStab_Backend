import { find } from "../../../helpers/index.js";


const getFaqCategory = async (req, res) => {
  try {


     const faqCategory = await find("faqCategory");

    console.log(faqCategory, "contentPage...");

    if (!faqCategory || faqCategory.length === 0) {
      return res.status(400).send({ status: 400, message: "No FAQ Category Found" });
    }

    return res.status(200).send({ status: 200, faqCategory });

  } catch (e) {

    return res.status(400).send({ status: 400, message: e.message });
  }
};

export default getFaqCategory;
