const { findOne } = require("../../helpers");

const getMetaData = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id.length)
      return res
        .status(400)
        .json({ status: 400, message: "medatadata id is required" });

    const nftMetaData = await findOne("nftMetaData", { _id: req.params.id });
    if (!nftMetaData)
      return res
        .status(404)
        .json({ status: 404, message: "nft metadata not found" });
    // return res.status(200).json({
    // status: 200,
    //   message: "nft metadata fetched successfully",
    //   data: nftMetaData,
    // });
    return res.status(200).json(nftMetaData);
  } catch (e) {
    console.log(e);
    return res.status(500).json({ status: 500, message: e.message });
  }
};
module.exports = getMetaData;
