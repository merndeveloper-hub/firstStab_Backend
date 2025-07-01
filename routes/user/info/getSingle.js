import Joi from "joi";
import { findOne} from "../../../helpers/index.js";

const schema = Joi.object({
  id: Joi.string().required(),
   
});

const singleContentPage = async (req, res) => {
  try {
   await schema.validateAsync(req.params);

    const { id} = req.params;
  

    let contentPage = await findOne("content", { _id:id });
    if (!contentPage) {
      return res.status(400).send({ status: 400, message: "No Page Found" });
    }

    return res
      .status(200)
      .send({ status: 200, contentPage });
  } catch (e) {
    console.log(e);
    return res.status(400).send({ status: 400, message: e.message });
  }
};

export default singleContentPage;
