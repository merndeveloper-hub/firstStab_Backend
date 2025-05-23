import { getDataWithLimit,find } from "../../../helpers/index.js";


const getFaqCategory = async (req, res) => {
  try {

  const page = parseInt(req.query.page) || 1;

    const limit = 5;
    const skip = (page - 1) * limit;
const sort = { createdAt: -1 };
    const faqCategory = await getDataWithLimit("faqCategory", {},sort, skip, limit);


    console.log(faqCategory, "contentPage...");

    if (!faqCategory || faqCategory.length === 0) {
      return res.status(400).send({ status: 400, message: "No FAQ Category Found" });
    }
const totalPage = await find('faqCategory')
    return res.status(200).send({ status: 200, faqCategory,totalLength:totalPage?.length });

  } catch (e) {

    return res.status(400).send({ status: 400, message: e.message });
  }
};

export default getFaqCategory;
