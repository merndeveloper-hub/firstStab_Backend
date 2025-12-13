import Joi from "joi";
import { findOne, updateDocument } from "../../../helpers/index.js";
import send_email from "../../../lib/node-mailer/index.js";

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

if (updateUser?.status == "Active") {
      await send_email(
        "adminApproved",
        {
        user: getPro?.first_Name,
        },
        process.env.SENDER_EMAIL,
        "Congratulations! You’re Now an Active Pro on FirstStab",
        getPro?.email
      );
    } else if (updateUser?.status == "InActive") {
     await send_email(
      "adminRejected",
      {
       user: getPro?.first_Name,
      },
      process.env.SENDER_EMAIL,
      "Pro Service Review Result – Rejected",
      getPro?.email
    );
    }

    return res.status(200).send({
      status: 200,
      message: `Service ${updateUser?.status} Successfully`,
      data: { updateUser },
    });
  } catch (e) {
    console.log(e);
    return res.status(400).send({ status: 400, message: e.message });
  }
};

export default hideService;
