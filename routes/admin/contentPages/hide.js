import Joi from "joi";
// const { findOne } = require("../../../helpers");
import { findOne, updateDocument } from "../../../helpers/index.js";

const schema = Joi.object({
  id: Joi.string().required(),
});

const hidePage = async (req, res) => {
  try {
    await schema.validateAsync(req.params);

    const { id } = req.params;

    let contentPage = await findOne("content", { _id: id });
    if (!contentPage || contentPage.length === 0 ) {
      return res
        .status(400)
        .send({ status: 400, message: "No Content Page Found" });
    }

    const hideContentPage = await updateDocument(
      "content",
      { _id: id },
      { status: "InActive" }
    );

 

    return res
      .status(200)
      .send({
        status: 200,
        message: "Update Content Page Successfully",
        hideContentPage,
      });
  } catch (e) {
    console.log(e);
    return res.status(400).send({ status: 400, message: e.message });
  }
};

export default hidePage;
