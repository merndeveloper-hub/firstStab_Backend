import { getDataWithLimit } from "../../../helpers/index.js";

const getContentPage = async (req, res) => {
  try {
    
const page = parseInt(req.query.page) || 1;

    const limit = 5;
    const skip = (page - 1) * limit;

    const contentPage = await getDataWithLimit(
      "content",
      {},
      skip,
      limit
    );

    console.log(contentPage, "contentPage...");

    if (!contentPage || contentPage.length === 0) {
      return res
        .status(400)
        .send({ status: 400, message: "No Content Page Found" });
    }

    return res.status(200).send({ status: 200, contentPage });
  } catch (e) {
    return res.status(400).send({ status: 400, message: e.message });
  }
};

export default getContentPage;
