import Joi from "joi";
import { findOne, getAggregate } from "../../../helpers/index.js";
import  ObjectID  from "../../../types/index.js";

const schema = Joi.object().keys({
  id: Joi.string().required(),
});

const getSingleCategory = async (req, res) => {
  try {
    await schema.validateAsync(req.params);
    const { id } = req.params;
    console.log(typeof id,"id");
   
    const singleCategory = await findOne("category", {_id:id})
   

    // const singleCategory = await getAggregate("category", [
    //   {
    //     $match: { _id: id },
    //   },
     
    //   {
    //     $sort: { _id: -1 },
    //   },
    // ]);

    console.log(singleCategory,"sinlge");
    
    return res.status(200).json({ status: 200, data:{singleCategory} });
  } catch (e) {
    console.log(e);
    return res.status(500).json({ status: 500, message: e.message });
  }
};

export default getSingleCategory;
