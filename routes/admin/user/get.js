const { getAggregate } = require("../../../helpers");
const { ObjectID } = require("../../../types");

const getUsers = async (req, res) => {
  try {
    const users = await getAggregate("user", [
      {
        $match: {
          type: {
            $ne: ObjectID(req.user.type),
          },
        },
      },
      {
        $sort: {
          _id: -1,
        },
      },
    ]);
    return res.status(200).send({ status: 200, users });
  } catch (e) {
    console.log(e);
    return res.status(500).send({ status: 500, message: e.message });
  }
};

module.exports = getUsers;
