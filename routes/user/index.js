import express from "express";

import category from "./category/index.js";
import booking from "./booking/index.js";
import account from "./account/index.js";
import info from "./info/index.js";
import home from "./home/index.js";
import inbox from "./inbox/index.js";
import serviceDetail from "./serviceDetail/index.js";

const router = express.Router();

router.use("/category", category);
router.use("/info", info);
router.use("/home", home);
router.use("/account", account);
router.use("/booking", booking);
router.use("/servicedetail", serviceDetail);
router.use("/inbox", inbox);

export default router;
