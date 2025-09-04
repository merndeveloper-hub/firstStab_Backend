const { findOne, deleteDocument } = require("../../../helpers");

const deleteRoles = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await findOne("user", { _id: id });
    if (!user) {
      return res.status(401).send({
        status: 401,
        message: "User not found",
      });
    }
    const deleteRole = await deleteDocument("user", { _id: id });
    return res
      .status(200)
      .send({ status: 200, message: "User Deleted Successfully" });
  } catch (e) {
    console.log(e);
    return res.status(500).send({ status: 500, message: e.message });
  }
};

module.exports = deleteRoles;
