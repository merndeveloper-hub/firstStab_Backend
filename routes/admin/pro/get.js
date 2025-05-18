import { getDataWithLimit,find } from "../../../helpers/index.js";

const getUser = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;

    const limit = 5;
    const skip = (page - 1) * limit;
const sort = { createdAt: -1 };
    const getUsers = await getDataWithLimit(
      "user",
      { userType: "pro" },
      sort,
      skip,
      limit
    );

    if (!getUsers || getUsers.length === 0) {
      return res.status(400).send({
        status: 400,
        message: "No Professional found",
      });
    }
 const findPro = await find('user', { userType: 'pro' })
    return res.status(200).json({ status: 200, data: { getUsers,totalLength:findPro?.length } });
  } catch (e) {
    console.log(e);
    return res.status(400).json({ status: 400, message: e.message });
  }
};

export default getUser;
