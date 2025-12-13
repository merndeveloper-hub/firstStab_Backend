import Joi from "joi";

import {
  deleteDocument,
  findOne,
} from "../../../helpers/index.js";

const schema = Joi.object({
  id: Joi.string().required(),
});

const deleteCategory = async (req, res) => {
  try {
    await schema.validateAsync(req.params);
    const { id } = req.params;
    const findCategory = await findOne("proCategory", { _id: id });
    if (!findCategory) {
      return res
        .status(401)
        .send({ status: 401, message: "No category found" });
    }

    const findBooking = await find("proBookingService", {
      categoryId: findCategory?.categoryId,
    });
   

    if (findBooking.length > 0) {
      return res
        .status(401)
        .send({
          status: 401,
          message:
            "This category can't be deleted because some bookings have already been made using it.",
        });
    }
    const category = await deleteDocument("proCategory", {
      _id: id,
    });

    return res
      .status(200)
      .send({
        status: 200,
        message: "Category deleted successfully",
        data: { category },
      });
  } catch (e) {
    console.log(e);
    return res.status(500).send({ status: 500, message: e.message });
  }
};

export default deleteCategory;
