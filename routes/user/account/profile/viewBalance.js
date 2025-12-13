import { findOne } from "../../../../helpers/index.js";

const findUserBalance = async (req, res) => {
  try {
    const findUser = await findOne("user", { _id: req.params.id });
    if (!findUser) {
      return res.status(401).send({ status: 401, message: "No User found" });
    }

    let data = {
      first_Name:findUser?.first_Name,
      last_Name:findUser?.last_Name,
      totalAmount: findUser?.totalAmount,
      totalEarnings: findUser?.totalEarnings,
      totalCharges: findUser?.totalCharges,
      netEarnings: findUser?.netEarnings,
      currentBalance: findUser?.currentBalance,
    };

    return res.status(200).send({ status: 200, data: { data } });
  } catch (e) {
    console.log(e);
    return res.status(500).send({ status: 500, message: e.message });
  }
};

export default findUserBalance;
