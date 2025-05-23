import Joi from "joi";
import { find, findOne, getAggregate } from "../../../helpers/index.js";


const schema = Joi.object().keys({
  id: Joi.string().required(),
});

const getSingleProCertificate = async (req, res) => {
  try {
    await schema.validateAsync(req.params);
    const { id } = req.params;

    const singlePro = await findOne("user", { _id: id });

    if (!singlePro || singlePro.length === 0) {
      return res.status(400).send({
        status: 400,
        message: "No Professional found",
      });
    }

const getCertificate = await find("proCategory",{proId:id})

    return res.status(200).json({ status: 200, data: { singlePro,getCertificate } });
  } catch (e) {
    console.log(e);
    return res.status(400).json({ status: 400, message: e.message });
  }
};

export default getSingleProCertificate;
