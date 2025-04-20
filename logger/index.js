import youtubeLogger from "./youtubeLogger.js";
import productionLogger from "./productionLogger.js";

let logger = null;
logger = youtubeLogger();

// if (process.env.NODE_ENV == "development") {
//   console.log("logger in dev");
  
// }

// if (process.env.NODE_ENV === "production") {
//   logger = productionLogger();
// }

export default logger;
