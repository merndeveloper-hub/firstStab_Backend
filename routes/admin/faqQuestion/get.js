import { getDataWithLimit,find } from "../../../helpers/index.js";


const getFaqQuestion = async (req, res) => {
  try {

 const page = parseInt(req.query.page) || 1;

    const limit = 5;
    const skip = (page - 1) * limit;
const sort = { createdAt: -1 };
    const faqQuestion = await getDataWithLimit("faqQuestion", {},sort, skip, limit);
   

    if (!faqQuestion || faqQuestion.length === 0) {
      return res
        .status(400)
        .send({ status: 400, message: "Does not exist faq questions" });
    }
const totalPage = await find('faqQuestion')
    return res.status(200).send({ status: 200, faqQuestion,totalLength:totalPage?.length });

  } catch (e) {

    return res.status(400).send({ status: 400, message: e.message });
  }
};

export default getFaqQuestion;
