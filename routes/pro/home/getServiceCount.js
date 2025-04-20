import Joi from "joi";
import { find } from "../../../helpers/index.js";

const schema = Joi.object().keys({
  id: Joi.string().required(),
});

const getServiceCategoryCount = async (req, res) => {
  try {
    await schema.validateAsync(req.params);
    const { id } = req.params;

    const getUserCategory = await find("proCategory", { proId: id });
    if (!getUserCategory || getUserCategory.length === 0) {
      return res.status(400).send({
        status: 400,
        message: "Service Not found",
      });
    }

    const getcategory = await find("category");

    const result = getUserCategory.map((item) => {
      const category = getcategory.find(
        (cat) => String(cat._id) === String(item.categoryId)
      );

      return {
        name: category ? category.name : "Unknown",
        subCategoryCount: item.subCategories.length,
        item: item,
      };
    });

    const getBusinness = await find("user",{_id:id,userType:"pro"});
  
    if (!getBusinness || getBusinness.length === 0) {
     
      return res.status(400).send({
        status: 400,
        message: "No Buniness Info found"
      });
    }


    
    return res.status(200).json({ status: 200, data: { result,getBusinnessName:getBusinness[0].businessname } });
  } catch (e) {
    console.log(e);
    return res.status(400).json({ status: 400, message: e.message });
  }
};

export default getServiceCategoryCount;
