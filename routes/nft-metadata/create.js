const Joi = require("joi");
// const fs = require("fs");
const { insertNewDocument } = require("../../helpers");
const cloudinary = require("cloudinary").v2;
const saveActivity = require('../../middleware/activity/save-activity');

const validationSchema = Joi.object({
  name: Joi.string().required(),
  description: Joi.string().required(),
  external_url: Joi.string(),
  attributes: Joi.array(),
});

const createMetaData = async (req, res) => {
  try {
    await validationSchema.validateAsync(req.body);
    if (!req?.files?.nft_image?.path) {
      return res.status(400).json({
        status: 400,
        message: "nft Image is required",
      });
    }
    const cloudObj = await cloudinary.uploader.upload(
      req?.files?.nft_image?.path,{quality: 20}
    );
    req.body.image = cloudObj.url;
    // fs.unlinkSync(req.file.path);
    const createDbObject = await insertNewDocument("nftMetaData", req.body);
    // return res.status(200).json({
    //   status: 200,
    //   message: "nft metadata created successfully",
    //   data: createDbObject,
    //   url: `${req.protocol}://${req.get("host")}/api/v1/nft-metadata/${
    //     createDbObject._id
    //   }`,
    // });

  saveActivity(req, res, `User ${createDbObject._id} created Nft metadata succcessfully`);
    return res.status(200).json({
      status: 200,
      message: "nft metadata created successfully",
      data: createDbObject,
      url: `https://dreamhub-server.herokuapp.com/api/v1/nft-metadata/${createDbObject._id}`,
    });
  } catch (e) {
    console.log(e);
    return res.status(500).json({ status: 500, message: e.message });
  }
};

module.exports = createMetaData;
