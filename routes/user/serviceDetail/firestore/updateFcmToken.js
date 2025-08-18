import {
  insertNewDocument,
  updateDocument,find
} from "../../../../helpers/index.js";

const updateFcmToken = async (req, res) => {
  try {
    const { fcmToken } = req.params;

    const findToken = await find("token", { fcmToken });
    if (findToken.length >0) {
      const insertToken = await updateDocument(
        "token",
        {},
        {
          fcmToken,
        }
      );

      return res
        .status(200)
        .send({
          status: 200,
          message: "FCM token updated successfully",
          insertToken,
        });
    }


    const insertToken = await insertNewDocument("token", {
      fcmToken,
    });

    return res
      .status(200)
      .send({
        status: 200,
        message: "FCM token updated successfully1",
        insertToken,
      });
  } catch (e) {
    console.log(e);
    return res.status(500).send({ status: 500, message: e.message });
  }
};

export default updateFcmToken;
