
import { insertNewDocument, findOne } from "../../../../helpers/index.js";





const findUser = async (req, res) => {
  try {






    const findUser = await findOne(
      "user",
      {_id:req.params.id}
    );
    if (!findUser) {
      return res.status(404).send({ status: 404, message: "No User found" });
    }
    return res
      .status(200)
      .send({ status: 200, data:{findUser} });


  } catch (e) {
    console.log(e);
    return res.status(500).send({ status: 500, message: e.message });
  }
};

export default findUser;
