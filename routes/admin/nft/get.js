const { getAggregate } = require("../../../helpers");
const { ObjectID } = require("../../../types");

const getNfts = async (req, res) => {
  try {
    const nfts = await getAggregate("nft", [
      {
        $match: {},
      },
      {
        $sort: {
          _id: -1,
        },
      },
    ]);
    return res.status(200).send({ status: 200, nfts });
  } catch (e) {
    console.log(e);
    return res.status(500).send({ status: 500, message: e.message });
  }
};

module.exports = getNfts;
