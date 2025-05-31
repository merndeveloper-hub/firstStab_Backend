import { find, updateDocument } from "../../../helpers/index.js";

const parseBoolean = value => {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") return value.toLowerCase() === "true";
  return undefined;
};

const updateServiceType = async (req, res) => {
  try {
    const { id: proId } = req.params;
    const { subCategories = [] } = req.body;

    if (!Array.isArray(subCategories) || subCategories.length === 0) {
      return res.status(400).json({ status: 400, message: "subCategories array is required." });
    }

    const proCategories = await find("proCategory", { proId });

    let updatedCount = 0;

    for (const doc of proCategories) {
      const updateMap = {};
      subCategories.forEach(sc => {
        if (sc.id) {
          updateMap[sc.id.toString()] = sc;
        }
      });

      let updated = false;

      const updatedSubCategories = doc.subCategories.map(subCat => {
        const subCatId = (subCat.id || subCat._id)?.toString();
        const changes = updateMap[subCatId];

        if (!changes) return subCat;

        // Only update provided fields, leave others as-is
        const updatedSubCat = { ...subCat };

        ["isRemote", "isChat", "isVirtual", "isInPerson"].forEach(field => {
          if (field in changes) {
            updatedSubCat[field] = parseBoolean(changes[field]);
          }
        });

        updated = true;
        return updatedSubCat;
      });
console.log(updatedSubCategories[0]._doc._id,"updatedSubCategories");
console.log(updatedSubCategories[0]._id,"------------");


      if (updated) {
        await updateDocument("proCategory", { _id: updatedSubCategories[0]._id }, {...req.body });
        updatedCount++;
      }
    }

    return res.status(200).json({
      status: 200,
      message: `${updatedCount} proCategory document(s) updated successfully.`,
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ status: 500, message: err.message });
  }
};

export default updateServiceType;
