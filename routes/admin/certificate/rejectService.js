import Joi from "joi";
import { findOne, updateDocument } from "../../../helpers/index.js";
import send_email from "../../../lib/node-mailer/index.js";

const schema = Joi.object().keys({
  id: Joi.string().required(),
});

const schemaBody = Joi.object().keys({
  rejectReason: Joi.string().required(),
});

const rejectProService = async (req, res) => {
  try {
    await schema.validateAsync(req.params);
    await schemaBody.validateAsync(req.body);
    const { id } = req.params;
    const { rejectReason } = req.body;

    const getService = await findOne("proCategory", { _id: id });
    if (!getService || getService.length === 0) {
      return res.status(400).send({
        status: 400,
        message: "No Service found",
      });
    }
    const getPro = await findOne("user", { _id: getService?.proId });
    let activeService;
    if (getPro?.totalPro < 5000) {
      console.log("if");

      activeService = await updateDocument(
        "proCategory",
        { _id: id },
        { status: "Reject", serviceStatus: "Rejected", rejectReason }
      );
    } else if (getPro?.totalPro > 5000) {
      activeService = await updateDocument(
        "proCategory",
        { _id: id },
        { status: "Reject", serviceStatus: "Rejected", rejectReason }
      );
    }
    await send_email(
      "signuptemplate",
      {
        otp: "123",
      },
      "owaisy028@gmail.com",
      "Verify Your Email",
      getPro?.email
    );

    return res.status(200).send({
      status: 200,
      message: `${activeService?.status} Pro Service`,
      activeService,
    });
  } catch (e) {
    console.log(e);
    return res.status(400).json({ status: 400, message: e.message });
  }
};

export default rejectProService;
