import Joi from "joi";

import { insertNewDocument, findOne } from "../../../../helpers/index.js";

const schemaBody = Joi.object().keys({
  email: Joi.string()
     .email({ tlds: { allow: true } }) // Ensures a valid domain with TLD (e.g., .com, .org)
     .pattern(new RegExp("^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$")) // Enforces common email rules
     .required()
     .messages({
       "string.email": "Invalid email format",
       "any.required": "Email is required",
       "string.pattern.base": "Invalid email structure",
     }),
  queryType: Joi.string(),
  querySuggestion: Joi.string(),
  message: Joi.string(),
  reqId: Joi.string(),
  id: Joi.string().required(),
});

const postQuery = async (req, res) => {
  try {
    await schemaBody.validateAsync(req.body);
    const { email, queryType, querySuggestion, message, reqId, id } = req.body;

    const findUser = await findOne("user", { _id: id });
    if (!findUser || findUser.length == 0) {
      return res.status(400).json({
        status: 400,
        message: "No User found!",
      });
    }

    const reportQuery = await insertNewDocument("reportQuery", {
      email,
      queryType,
      querySuggestion,
      message,
      reqId,
      id,
      role: findUser?.userType,
    });

    return res.status(200).json({
      status: 200,
      reportQuery
    });
  } catch (e) {
    console.log(e);
    return res.status(400).json({ status: 400, message: e.message });
  }
};

export default postQuery;
