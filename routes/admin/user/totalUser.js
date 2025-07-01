import { find } from "../../../helpers/index.js";

const findUser = async (req, res) => {
  try {
    console.log("in----------");

    const findUser = await find('user', { userType: 'user' })

    const findUserActive = await find('user', { userType: 'user', status: "Active" })

    const findUserInActive = await find('user', { userType: 'user', status: "InActive" })


     const findPro = await find('user', { userType: 'pro' })

    const findProActive = await find('user', { userType: 'pro', status: "Active" })

    const findProInActive = await find('user', { userType: 'pro', status: "InActive" })


    // if (!findUser || findUser.length === 0) {
    //   return res.status(400).send({
    //     status: 400,
    //     message: "No Users found",
    //   });
    // }
    const countPro = {
      Active: findProActive.length || 0,
      Inactive: findProInActive.length || 0,
      TotalUser: findPro.length || 0
    };

    // if (!findUser || findUser.length === 0) {
    //   return res.status(400).send({
    //     status: 400,
    //     message: "No Users found",
    //   });
    // }
    const countUser = {
      Active: findUserActive.length || 0,
      Inactive: findUserInActive.length || 0,
      TotalUser: findUser.length || 0
    };
    return res.status(200).json({ status: 200, data: { countUser,countPro } });
  } catch (e) {
    console.log(e);
    return res.status(400).json({ status: 400, message: e.message });
  }
};

export default findUser;





















