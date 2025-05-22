import mongoose  from "mongoose";
mongoose.Promise = global.Promise;

import userType from "./userType/index.js";
import user from "./user/index.js";
import attempt from "./attempts/index.js";
import userOTP from "./otpVerification/index.js";
import category from "./categorie/index.js";
import subCategory from "./subCategorie/index.js";
//import subSubCategory from "./subSubCategorie/index.js";
import faqCategory from "./faqCategorie/index.js";
import proCategory from "./proCategorie/index.js";
import proBusin from "./proBusiness/index.js";
import token from "./token/index.js";
import content from "./content/index.js";
import userPayment from "./userPayment/index.js";
import faqQuestion from "./faqQuestion/index.js";
import payment from "./payments/index.js";
import contactUs from "./contactUs/index.js";
import userBookServ from "./userBookService/index.js";
import address from "./address/index.js";
import bookingDetail from "./booking/index.js";
import proBookingService from "./proBookingService/index.js";
import serviceDetail from "./serviceDetail/index.js";
import chatRole from "./chatRole/index.js";
import chatMessage from "./chatMessage/index.js";
import chat from "./chat/index.js";
import review from "./reviews/index.js";
import apiLog from "./apiLog/index.js";
import adminFees from "./adminFees/index.js";


 const db = {};

 db.mongoose = mongoose;

// const db = {
//   userType: "./userType/index.js"
 
// };


db.apiLog=apiLog
db.user = user
db.serviceDetail=serviceDetail
 db.userType = userType;
 db.attempt = attempt
 db.userOTP=userOTP;
 db.category=category
 db.subCategory=subCategory
 db.review=review
 //db.subSubCategory=subSubCategory

 db.proCategory=proCategory
 db.proBusin=proBusin
 db.token=token
 db.content=content
 db.faqCategory=faqCategory
 db.faqQuestion=faqQuestion
 db.payment=payment
 db.contactUs=contactUs
 db.userBookServ=userBookServ
 db.bookingDetail=bookingDetail
 db.address=address
 db.proBookingService=proBookingService
 db.userPayment = userPayment
 db.chatRole=chatRole
 db.chatMessage=chatMessage
 db.chat=chat
 db.adminFees=adminFees
// db.follow = require("./follow");
// db.nft = require("./nft");
// db.blog = require("./blog");
// db.bid = require("./bid");
// db.history = require("./history");
// db.auction = require("./auction");
// db.attempt = require("./attempts");
// db.nftMetaData = require("./nft-metadata");
// db.activity = require("./activity");
// db.subscribe = require("./subscribe");
// db.pandoras = require("./pandoras");
// db.UserOTPVerification = require("./otpVerification");
// db.allowlist = require("./allowlist");
// db.pandorasAllowlist = require("./pandorasAllowlist");
// db.launchPad = require("./launchPad");
// db.multipleUser = require("./multipleUser");
// db.multipleUserSell = require("./multipleUserSell");
// db.nftcollection = require("./nftCollection");
// db.swapbid = require("./swapbid");
// db.importCollection = require("./importCollection");
// db.dhcontractcollection = require("./dhcontractCollection");
// db.launchpadMetaData = require("./launchpad-metadata");


export default db;
