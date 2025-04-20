const { updateDocument, findOne } = require("../../../helpers");
const cloudinary = require("cloudinary").v2;

// const fs = require("fs");
const updateAdminProfile = async (req, res) => {
  try {
    if (req?.files?.profile_img?.path) {
      // console.log(req.file.path);
      const nft_img = await cloudinary.uploader.upload(
        req?.files?.profile_img?.path , {quality: 20}
      );
      req.body.profile_img = nft_img.url;
      // fs.unlinkSync(req.file.path);
      // console.log(nft_img);
    }
    // const findUser = await findOne("user", { _id: req.userId });
    // if (!findUser) {
    //   return res.status(404).send({ status: 404, message: "User not found" });
    // }
    const user = await updateDocument(
      "user",
      {
        _id: req.userId,
      },
      {
        ...req.body,
      }
    );
    user.following = undefined;
    user.followers = undefined;
    user.password = undefined;

    return res.status(200).send({
      status: 200,
      user,
      message: "Profile updated successfully",
    });
  } catch (e) {
    console.log(e);
    return res.status(500).send({ status: 500, message: e.message });
  }
};

module.exports = updateAdminProfile;
