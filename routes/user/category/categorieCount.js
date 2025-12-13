import Joi from "joi";
import { find } from "../../../helpers/index.js";




const schema = Joi.object().keys({
  id: Joi.string().required(),
});

const getSingleCategoryCount = async (req, res) => {
  try {
    await schema.validateAsync(req.params);
    const { id } = req.params;



    const getUserCategory = await find('proCategory', { userId: id })


    const getcategory = await find('category')





    const result = getUserCategory.map(item => {
      const category = getcategory.find(cat => String(cat._id) === String(item.categoryId));



      return {
        name: category ? category.name : 'Unknown',
        subCategoryCount: item.subCategories.length
      };
    });






    return res.status(200).json({ status: 200, data: { result } });
  } catch (e) {
    console.log(e);
    return res.status(500).json({ status: 500, message: e.message });
  }
};

export default getSingleCategoryCount;
