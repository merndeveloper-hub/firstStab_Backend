import express from "express";
import addUserType  from "./add-user-type.js";
import deleteUserType from "./delete-user-type.js";
import getUserTypes  from "./get-user-types.js";
import updateUserType  from "./update-user-type.js";
import tokenVerification from "../../middleware/token-verification/index.js";

const router = express.Router();
// ROUTES * /api/user/
router.get("/get-user-types",tokenVerification, getUserTypes);
router.post("/add-user-type",tokenVerification, addUserType);
router.delete("/delete-user-type",tokenVerification, deleteUserType);
router.put("/update-user-type/:id",tokenVerification, updateUserType);

export default router;
