import express from "express";
import addUserType  from "./add-user-type.js";
import deleteUserType from "./delete-user-type.js";
import getUserTypes  from "./get-user-types.js";
import updateUserType  from "./update-user-type.js";

const router = express.Router();
// ROUTES * /api/user/
router.get("/get-user-types", getUserTypes);
router.post("/add-user-type", addUserType);
router.delete("/delete-user-type", deleteUserType);
router.put("/update-user-type/:id", updateUserType);

export default router;
