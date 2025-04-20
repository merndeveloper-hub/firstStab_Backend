import express from 'express';
import bodyParser  from "body-parser";
import mongoose  from "./config/db/index.js";
import morgan  from "morgan";
import cors  from "cors";
import routes  from "./routes/index.js";
import {PORT} from './config/index.js'
const app = express();

//Socket
import http from 'http';
import { Server } from "socket.io";
import logger  from './logger/index.js' ;
//import  arcjetMiddleware  from'./middleware/arcjet/index.js';
import  errorMiddleware   from './middleware/error-middleware/index.js';
import handleSocket from './routes/user/serviceDetail/firestore/socketHandlerSender.js';



const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*", methods: "*" } });




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
app.use(bodyParser.json({limit: "50mb"}));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));
app.use(morgan("short"));
//app.use(arcjetMiddleware);
app.set("trust proxy", true);

app.use((req, res, next) => {
  console.log("Client IP:", req.headers["x-forwarded-for"] || req.connection.remoteAddress);
  next();
});


// * Api routes
app.use("/api/v1",routes);

 app.use(errorMiddleware);

app.get("/", async (req, res) => {
 // res.send("check");
//  const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
// console.log('Client IP:', ip);
//   logger.info("get API")
//   logger.info(`Incoming Request: ${req.method} ${req.url}`);
   return res.status(200).json({ status: 200, message: "FirstStab" });
 });

 // Socket.IO

const socketNamespace = io.of('/api/v1/socket');
handleSocket(socketNamespace);
// io.on("connection", (socket) => {
//   //when connect
//   console.log("New client connected with id: ", socket.id);

//   //when disconnect
//   socket.on("disconnect", () => {
//     console.log("a user disconnected!", socket.id);
//   });
// });


app.use("*",(req,res) => {
   res.status(404).send("Route not found");
});


console.log(PORT ,"process.env.PORT ");

let port = process.env.PORT | 5000

server.listen(port,() => {
 logger.info("Server is running on port 3000");
  console.log(`Server is running on PORT http://localhost:${port}`);
  
})