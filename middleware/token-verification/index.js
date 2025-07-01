import jwt from "jsonwebtoken";
import  {SECRET}  from "../../config/index.js";
import  {findOne} from "../../helpers/index.js";

const tokenVerification = (req, res, next) => {
  try {
    let token = req.headers["token"];
    console.log(token,"token");
    
    if (!token) {
      return res
        .status(404)
        .send({ status: 404, message: "No token provided!" });
    }
    jwt.verify(token, SECRET, async (err, decoded) => {
      console.log(decoded,"decoded");
      
      if (err) {
        console.log(err);
        return res
          .status(400)
          .send({ status: 400, message: "Token Unauthorized!" });
      }
      // if (!decoded.user) {
      // 	return res.status(400).send({ status: 400, message: "Upgrade your token" });
      // }
      const isUserExist = await findOne("user", { _id: decoded.id });
      console.log(isUserExist,"isuer");
      
      if (!isUserExist) {
        return res.status(404).send({
          status: 404,
          message: "User does not exist with your token",
        });
      }
      req.userId = isUserExist._id;
      req.user = isUserExist;
      next();
    });
  } catch (e) {
    console.log("Token verification Error", e.message);
    return res.status(400).send({ status: 400, message: e.message });
  }
};

export default tokenVerification ;
