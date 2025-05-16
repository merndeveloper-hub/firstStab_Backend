import { getDataWithLimit } from "../../../helpers/index.js";


const getFaqQuestion = async (req, res) => {
  try {

 const page = parseInt(req.query.page) || 1;

    const limit = 5;
    const skip = (page - 1) * limit;

    const faqQuestion = await getDataWithLimit("faqQuestion", {}, skip, limit);
   

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
