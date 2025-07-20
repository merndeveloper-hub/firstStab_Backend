import express from "express";
import bodyParser from "body-parser";
import mongoose from "./config/db/index.js";
import morgan from "morgan";
import cors from "cors";
import https from "https";
import { pinoHttpMiddleware, changed,pinoInstance } from "./utils/logger/logger.js";
//import { pinoInstance } from '../logger.js';
const log = pinoInstance.child({ context: 'userService' });
import { apiLogger } from './middleware/apiLogger/index.js';
import routes from "./routes/index.js";
import { PORT } from "./config/index.js";
const app = express();

//Socketf
import http from "http";
import { Server } from "socket.io";
//import { initSocket } from './socket.js';
//import logger from "./logger/index.js";
//import  arcjetMiddleware  from'./middleware/arcjet/index.js';
import errorMiddleware from "./middleware/error-middleware/index.js";
import handleSocket from "./routes/user/serviceDetail/firestore/socketHandlerSender.js";
//import userBookReqSocket from "./routes/user/serviceDetail/firestore/userSocket.js";
import { registerAllSockets } from "./routes/user/serviceDetail/firestore/index.js";

//user and pro booking flow socket
//import { registerAllSockets } from "./routes/user/serviceDetail/firestore/index.js";
// const SERVICE_PORT = config.PORT;
const SERVICE_PORTHTTPS = "5001";

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*", methods: "*" } });

//User and pro booking flow socket
registerAllSockets(io);

var db = mongoose.connection;

db.on("error", console.error.bind(console, "connection error:")),
  db.once("open", async function () {
    console.log("db connected!");
  });

// * Cors
app.use(
  cors({
    origin: "*",
    credentialsL: "*",
  })
);

// * Body Parser
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));
app.use(pinoHttpMiddleware);

// Initialize socket.io
//initSocket(server);


//-----logger insert db----/////
app.use(apiLogger); // ✅ Apply here
//app.use(loggerMiddleware);
//app.use(morgan("short"));
//app.use(arcjetMiddleware);
app.set("trust proxy", true);

app.use((req, res, next) => {
  console.log(
    "Client IP:",
    req.headers["x-forwarded-for"] || req.connection.remoteAddress
  );
  next();
});

// * Api routes
app.use("/api/v1", routes);

app.use(errorMiddleware);

app.get("/", async (req, res) => {
  // res.send("check");
  //  const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  // console.log('Client IP:', ip);
  //   logger.info("get API")
  //   logger.info(`Incoming Request: ${req.method} ${req.url}`);
   req.log.info("Ping request received");
  return res.status(200).json({ status: 200, message: "FirstStab" });
});

//logger
app.get("/ping", (req, res) => {
  req.log.info("Ping request received");
  res.send("pong");
});

app.post("/log-level", changed);

// Socket.IO
// chat b/w user and pro before booking
const socketNamespace = io.of("/api/v1/socket");
handleSocket(socketNamespace);




// //user booking request socket
// const socketUserBookReq = io.of("/api/v1/userBookReqSocket");
// userBookReqSocket(socketUserBookReq)




// io.on("connection", (socket) => {
//   //when connect
//   console.log("New client connected with id: ", socket.id);

//   //when disconnect
//   socket.on("disconnect", () => {
//     console.log("a user disconnected!", socket.id);
//   });
// });

app.use("*", (req, res) => {
  res.status(404).send("Route not found");
});

console.log(PORT, "process.env.PORT ");

let port = process.env.PORT | 5000;

// const server = app.listen(SERVICE_PORT, function () {
//     const port = server.address().port
//     console.log("HTTP server started on ", port);
//     serverlogger.info("HTTP server started on ", port);

// });

const serverhttps = https
  .createServer(app)
  .listen(SERVICE_PORTHTTPS, function () {
    const port = serverhttps.address().port;
    console.log("HTTPS server started on ", port);
    log.info("HTTPS server started on ", port);
  });

server.listen(port, () => {
  //logger.info("Server is running on port 3000");
  console.log(`Server is running on PORT http://localhost:${port}`);
  //   console.log("HTTPS server started on ", port);
 log.info("HTTPS server started on ", port);
  //  serverlogger.info("HTTPS server started on ", port);
});

const closeServer = () => {
  serverlogger.info("closing app");
};

process.on("SIGTERM", closeServer);
process.on("SIGINT", closeServer);

process.on("uncaughtException", (err) => {
  console.log(err, "uncaughtException");

  log.error(err.stack);
});

process.on("exit", (err) => {
  console.log(err, "exit");
 log.error(err.stack);
});
