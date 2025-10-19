import { find, findOne } from "../../../../helpers/index.js";

const getBooking = async (req, res) => {
  try {
    const findUser = await findOne("user", { _id: req.params.id });
    if (!findUser) {
      return res.status(401).send({ status: 401, message: "No User found" });
    }

    if (findUser?.userType == "pro") {
      const getBook = await find("proBookingService", {
        professsionalId: req.params.id,
      });

      // Array se sirf requestId extract karo
      const requestIds = getBook?.map((booking) => booking.requestId) || [];

      return res.status(200).send({
        status: 200,
        data: requestIds,
      });
    } else if (findUser?.userType == "user") {
      const getBook = await find("proBookingService", {
        userId: req.params.id,
      });

      // Array se sirf requestId extract karo
      const requestIds = getBook?.map((booking) => booking.requestId) || [];

      return res.status(200).send({
        status: 200,
        data: requestIds,
      });
    }

    return res.status(200).send({ status: 200, data: [] });
  } catch (e) {
    console.log(e);
    return res.status(500).send({ status: 500, message: e.message });
  }
};

export default getBooking;
