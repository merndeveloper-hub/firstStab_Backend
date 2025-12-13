import { getDataWithLimit, find } from "../../../helpers/index.js";

const getContentPage = async (req, res) => {
  try {

    const page = parseInt(req.query.page) || 1;

    const limit = 5;
    const skip = (page - 1) * limit;
    const sort = { createdAt: -1 };
    const contentPage = await getDataWithLimit(
      "content",
      {},
      sort,
      skip,
      limit
    );



    if (!contentPage || contentPage.length === 0) {
      return res
        .status(400)
        .send({ status: 400, message: "No Content Page Found" });
    }
    const totalPage = await find('content')
    return res.status(200).send({ status: 200, contentPage, totalLength: totalPage?.length });
  } catch (e) {
    return res.status(400).send({ status: 400, message: e.message });
  }
};

export default getContentPage;
