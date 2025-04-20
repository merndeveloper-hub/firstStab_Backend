const {findAndSort,findOne } = require("../../../helpers/index");

const getActivity = async (req, res) => {
  try {
    const user_id = req.params.id;
    if (!user_id.length)
      res.status(400).json({ status: 400, message: "User id is required" });


console.log(user_id, "userid..");

    const checkUser = await findOne("user", { _id: user_id });
    if (!checkUser)
      return res.status(400).json({ status: 400, message: "user not found" });
   
      console.log(checkUser, "checkuser..");
   
      const activities = await findOne(
      "activity",
      { user_id: user_id }
    );


    console.log(activities, "activities..");
    return res.status(200).json({ status: 200, data: activities });
  } catch (e) {
    console.log(error);
    return res.status(500).json({ status: 500, message: error.message });
  }
};

module.exports = getActivity;


// const Joi = require("joi");
// const { findOne } = require("../../../helpers/index");

// const schema = Joi.object({
//   id: Joi.string().required(),
// });
// const activityUser = async (req, res) => {
//   try {
//     await schema.validateAsync(req.params);
//     const { id } = req.params;

//     const user = await findOne("activity", {
//       _id: id,
//       action: req.body.action,
//     });

//     console.log(user, "user.....");

//     if (!user) {
//       return res.json({ status: 400, message: "User not found" });
//     }

//     return res.status(200).send({
//       status: 200,

//       message: user,
//     });
//   } catch (e) {
//     console.log(e);
//     return res.status(500).send({ status: 500, message: e.message });
//   }
// };

// module.exports = activityUser;




// const { find } = require("../../../helpers");

// const activityUser = async (req, res, action) => {
//   try {
//     const {id} = req.params
//     //console.log("helllll.....")
    
//     const activity = await find("activity", {
//       user_id: id,
//       action: req.body.action
//     });
// // res.status(200).json({status: 200, message: activity});
//     console.log(activity,"eeeeeee");
   
//      return res.status(200).json({status: 200, message:activity});
//   } catch (e) {
//     console.log(e);
//      return res.status(500).json({ status: 500, message: e.message });
    
//   }
// };

// module.exports = activityUser;






