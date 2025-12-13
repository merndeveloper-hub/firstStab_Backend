import {
  findOne,
  updateDocument,
} from "../../../helpers/index.js";

const updateServiceType = async (req, res) => {
  const { id: proId } = req.params; // proId
  const { subCategories } = req.body;
  const {
    id,
    isChat,
    isInPerson,
    isRemote,
    isVirtual,
    complexity_tier,
    price_model,
    fixed_price,
    min_price,
    max_price,
  } = req.body.subCategories[0];


  let getSubCategories = subCategories[0].id;
  let updateBody = req.body.subCategories[0];

  try {
    const proCategories = await findOne("proCategory", {
      proId,
      "subCategories.id": getSubCategories,
    });


    if (!proCategories || proCategories.length === 0) {
      return res
        .status(401)
        .json({ message: "ProCategory not found for this proId" });
    }

    const updateCategory = await updateDocument(
      "proCategory",
      { proId, "subCategories.id": getSubCategories },
      {
        subCategories: {

          id,
          isChat,
          isInPerson,
          isRemote,
          isVirtual,
        },
        updateBody,
        complexity_tier,
        price_model,
        fixed_price,
        min_price,
        max_price,
      }
    );

    return res.status(200).json({
      message: "Subcategories updated successfully",
    });
  } catch (error) {
    console.error("Error in updateServiceType:", error);
    return res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};

export default updateServiceType;
