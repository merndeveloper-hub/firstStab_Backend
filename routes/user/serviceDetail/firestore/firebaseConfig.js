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
