import Joi from "joi";
import { deleteDocument } from "../../../../helpers/index.js";

const schema = Joi.object({
  id: Joi.string().required(),
});

const deleteAddress = async (req, res) => {
  try {
    await schema.validateAsync(req.params);
    const { id } = req.params;

    const deletedAddress = await deleteDocument(
      "address",

      {
        _id: id,
      }
    );

    if (!deletedAddress || deletedAddress.length == 0) {
      return res
        .status(400)
        .send({ status: 400, message: "Address Not found" });
    }

    return res
      .status(201)
      .send({ status: 201, message: "Address deleted successfully" });
  } catch (e) {
    console.log(e);
    return res.status(400).send({ status: 400, message: e.message });
  }
};

export default deleteAddress;
