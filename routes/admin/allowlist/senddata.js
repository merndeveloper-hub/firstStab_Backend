const { findOne, insertNewDocument } = require("../../../helpers");

const senddata = async (req, res) => {
  try {
    const { address } = req.body;
    if (address === "")
      return res
        .status(404)
        .json({ status: 404, message: "Address is required" });

    const findaddress = await findOne("allowlist", { address });
    console.log(findaddress);
    // If it does
    if (findaddress) {
      return res
        .status(208)
        .json({ status: 208, messsage: "You have already address" });
    }

    const nameData = await insertNewDocument("allowlist", { address });
    // // if (!nameData)
    // //   return res
    // //     .status(404)
    // //     .json({ status: 404, message: "User not found" });

    //const namedata = await allowlist.create({address});

    return res
      .status(200)
      .json({
        status: 200,
        message: "Address is added successfully",
      });
  } catch (e) {
    console.log(e);
    return res.status(500).json({ status: 500, message: e.message });
  }
};
module.exports = senddata;
