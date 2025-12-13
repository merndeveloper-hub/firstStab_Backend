import Joi from "joi";
import { findOne, updateDocument } from "../../../helpers/index.js";
import send_email from "../../../lib/node-mailer/index.js";

const schema = Joi.object().keys({
  id: Joi.string().required(),
});

const activeProService = async (req, res) => {
  try {
    await schema.validateAsync(req.params);
    const { id } = req.params;

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
   

      activeService = await updateDocument(
        "proCategory",
        { _id: id },
        {
          status: getService?.status == "Active" ? "InActive" : "Active",
          serviceStatus:
            getService?.serviceStatus == "success" ? "pending" : "success",
        }
      );
    } else if (getPro?.totalPro > 5000) {
      activeService = await updateDocument(
        "proCategory",
        { _id: id },
        {
          status: getService?.status == "Active" ? "Pending" : "Active",
          serviceStatus:
            getService?.serviceStatus == "success" ? "pending" : "success",
        }
      );
    }

    if (activeService?.status == "Active"){
      await send_email(
        "adminApproved",
        {
        user: getPro?.first_Name,
        },
        process.env.SENDER_EMAIL,
        "Congratulations! You’re Now an Active Pro on FirstStab",
        getPro?.email
      );
    }
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

export default activeProService;
