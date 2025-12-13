import Joi from "joi";
import { findOne, updateDocument } from "../../../helpers/index.js";
import send_email from "../../../lib/node-mailer/index.js";

const schema = Joi.object({
  id: Joi.string().required(),
});

const hideUser = async (req, res) => {
  try {
    await schema.validateAsync(req.params);
    const { id } = req.params;
    const findUser = await findOne("user", { _id: id, userType: "pro" });
    if (!findUser || findUser.length === 0) {
      return res.status(400).send({
        status: 400,
        message: "No Professional found",
      });
    }
    const updateUser = await updateDocument(
      "user",
      {
        _id: id,
        userType: "pro",
      },
      { status: findUser?.status == "Active" ? "InActive" : "Active" }
    );
  if (updateUser?.status == "Active") {
      await send_email(
        "adminAccountActive", // Template name change
        {
          user: findUser?.first_Name,
        },
        process.env.SENDER_EMAIL,
        "Your FirstStab Account is Now Active", // Consistent subject
        findUser?.email
      );
    } else if (updateUser?.status == "InActive") {
      await send_email(
        "adminAccountDeactive", // Template name change
        {
          user: findUser?.first_Name,
        },
        process.env.SENDER_EMAIL,
        "Important: Your FirstStab Account Has Been Deactivated", // Better subject
        findUser?.email
      );
    }

  
    return res.status(200).send({
      status: 200,
      message: `Professional ${updateUser?.status} Successfully`,
      data: { updateUser },
    });
  } catch (e) {
    console.log(e);
    return res.status(400).send({ status: 400, message: e.message });
  }
};

export default hideUser;
