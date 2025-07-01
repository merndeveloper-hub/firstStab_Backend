import mongoose from "mongoose";
import proBusinSchema from "./proBusinessSchema.js";

const proBusin = mongoose.model("proBusin", proBusinSchema);

export default proBusin;
