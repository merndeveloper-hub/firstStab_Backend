import { find } from "../../../helpers/index.js";


const getFaqQuestion = async (req, res) => {
  try {


    let faqQuestion = await find("faqQuestion");

    if (!faqQuestion || faqQuestion.length === 0) {
      return res
        .status(400)
        .send({ status: 400, message: "Does not exist faq questions" });
    }

    return res.status(200).send({ status: 200, faqQuestion });

  } catch (e) {

    return res.status(400).send({ status: 400, message: e.message });
  }
};

export default getFaqQuestion;
