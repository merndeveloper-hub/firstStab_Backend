import mongoose from "mongoose";
import { DB_USER, DB_PASS, DB_NAME } from "../index.js";



      //* --- dev
// let connect =   `mongodb+srv://${DB_USER}:${DB_PASS}@cluster0.1wehduf.mongodb.net/${DB_NAME}?retryWrites=true&w=majority&appName=Cluster0`
 let connect =   `mongodb+srv://${DB_USER}:${DB_PASS}@firststab.gcnfuvu.mongodb.net/${DB_NAME}?retryWrites=true`


 // console.log(connect,"connect");

mongoose.connect(
 connect
);

export default mongoose;
