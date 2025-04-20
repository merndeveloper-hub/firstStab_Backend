import Joi from "joi";
import {
  deleteDocument,
  findOne,
} from "../../../helpers/index.js";

const schema = Joi.object({
  id: Joi.string().required(),
});

const removeServiceCategory = async (req, res) => {
  try {
    await schema.validateAsync(req.params);
    const { id } = req.params;
    const findCategory = await findOne("proCategory", { _id: id });
    if (!findCategory || findCategory.length == 0) {
      return res.status(400).send({ status: 400, message: "Service Category Not found" });
    }
    const serviceCategory = await deleteDocument("proCategory", {
      _id: id,
    });

    return res
      .status(200)
      .send({ status: 200, message: "Service Category deleted successfully"});
  } catch (e) {
    console.log(e);
    return res.status(400).send({ status: 400, message: e.message });
  }
};

export default removeServiceCategory;
