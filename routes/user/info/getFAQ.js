import {  findAndSort } from "../../../helpers/index.js";


const getFaqQuestion = async (req, res) => {
  try {
   
    const faqQuestions = await findAndSort("faqQuestion", { displayPostion: { $gte: 0 } }, { displayPostion: 1 });

    console.log(faqQuestions, "contentPage...");

    if (!faqQuestions) {
      return res.status(404).send({ status: 404, message: "No FAQ Questions Found" });
    }

    return res.status(200).send({ status: 200, faqQuestions });

  } catch (e) {
    return res.status(400).send({ status: 400, message: e.message });
  }
};

export default getFaqQuestion;
