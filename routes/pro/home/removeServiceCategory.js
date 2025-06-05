import Joi from "joi";
import {
  deleteManyDocument
 
} from "../../../helpers/index.js";

const schema = Joi.object({
  id: Joi.string().required(),
});

const removeServiceCategory = async (req, res) => {
  try {
    await schema.validateAsync(req.params);
    const { id } = req.params;
    const{proId} = req.body
    // const findCategory = await find("proCategory", { categoryId: id });
    // if (!findCategory || findCategory.length == 0) {
    //   return res.status(400).send({ status: 400, message: "Service Category Not found" });
    // }
    const serviceCategory = await deleteManyDocument("proCategory", {
      categoryId: id,proId
    });

    return res
      .status(200)
      .send({ status: 200, message: "Service Category deleted successfully" });
  } catch (e) {
    console.log(e);
    return res.status(400).send({ status: 400, message: e.message });
  }
};

export default removeServiceCategory;
