import Joi from "joi";
import { updateDocument, findOne } from "../../../helpers/index.js";

const schema = Joi.object({
  availability: Joi.string().required(),

});

const schemaForId = Joi.object({
  id: Joi.string().required(),
});

const updateAvailability = async (req, res) => {
  try {
    await schemaForId.validateAsync(req.params);
    await schema.validateAsync(req.body);
    const { id } = req.params;
    const { availability } = req.body
    const findPro = await findOne("user", { _id: id });
    if (!findPro) {
      return res.status(401).send({ status: 401, message: "No Professional found" });
    }


    const profile = await updateDocument(
      "user",
      {
        _id: id,
      },
      {
        availability,
      }
    );

    return res
      .status(200)
      .send({
        status: 200,
        message: "Pro availability updated successfully",
        data: { profile },
      });
  } catch (e) {
    console.log(e);
    return res.status(500).send({ status: 500, message: e.message });
  }
};

export default updateAvailability;
