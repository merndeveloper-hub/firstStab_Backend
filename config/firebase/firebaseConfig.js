import { readFileSync } from "fs";
import admin from "firebase-admin";

const serviceAccount = JSON.parse(
  readFileSync(
    "./config/firebase/firststab-2c8c3-firebase-adminsdk-fbsvc-2b79a1e77e.json",
    "utf8"
  )
);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

export default {
  admin,
  db,
};


// // const admin = require("firebase-admin");
// // const serviceAccount = require("../serviceAccountKey.json");

// // admin.initializeApp({
// //   credential: admin.credential.cert(serviceAccount),
// //   databaseURL: "https://<your-project-id>.firebaseio.com", // for RTDB
// //   storageBucket: "<your-project-id>.appspot.com"
// // });

// // const db = admin.firestore();
// // const rtdb = admin.database();

// // module.exports = { admin, db, rtdb };