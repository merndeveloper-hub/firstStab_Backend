import Joi from "joi";
import { findOne, updateDocument } from "../../../helpers/index.js";

const schema = Joi.object({
  id: Joi.string().required(),
});

const hideService = async (req, res) => {
  try {
    await schema.validateAsync(req.params);
    const { id } = req.params;
    const findUser = await findOne("proCategory", { _id: id});
    if (!findUser || findUser.length === 0) {
      return res.status(400).send({
        status: 400,
        message: "No Services found",
      });
    }
    const updateUser = await updateDocument(
      "proCategory",
      {
        _id: id,
      },
      { status: findUser?.status == "Active" ? "InActive" : "Active" }
    );

    return res.status(200).send({
      status: 200,
      message: `Service ${findUser?.status} successfully`,
      data: { updateUser },
    });
  } catch (e) {
    console.log(e);
    return res.status(400).send({ status: 400, message: e.message });
  }
};

export default hideService;
