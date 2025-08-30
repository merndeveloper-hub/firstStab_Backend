import { findOne } from "../../../helpers/index.js";

const afterLoginBgLink = async (req, res) => {
  try {
    const { id } = req.params;

    const getProService = await findOne("proCategory", {
      proId: id,
      status: "Pending",
    });
    if (!getProService) {
      return res
        .status(400)
        .json({ status: 400, message: "No Service Found!" });
    }
    let findCategory = getProService?.categoryId;
    let findSubCategory = getProService?.subCategories[0]?.id;
    const getCategory = await findOne("category", {
      _id: findCategory,
    });
    const getSubCategory = await findOne("subCategory", {
      _id: findSubCategory,
     
    });
    return res
      .status(200)
      .json({
        status: 200,
        data: { getProService, getCategory, getSubCategory },
      });
  } catch (e) {
    console.log(e);
    return res.status(400).json({ status: 400, message: e.message });
  }
};

export default afterLoginBgLink;
