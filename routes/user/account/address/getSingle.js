import { findOne } from "../../../../helpers/index.js";

const getSingleUserAddress = async (req, res) => {
  try {
    const { id } = req.params;

    const getUserAddress = await findOne("address", { userId: id });
    if (!getUserAddress || getUserAddress.length == 0) {
      return res.status(400).send({ status: 400, message: "No Address found" });
    }
    return res.status(200).send({ status: 200, data: { getUserAddress } });
  } catch (e) {
    console.log(e);
    return res.status(500).send({ status: 500, message: e.message });
  }
};

export default getSingleUserAddress;
