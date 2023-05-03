import Express from "express";
import { testrouter } from "./routes/index.testroutes.js";
import cors from "cors";
import bodyParser from 'body-parser';
import http from "http"

const testapp = Express();
const conn = http.createServer(testapp)
conn.maxConnections = 20000;
testapp.use(bodyParser.json({limit: '50mb'}));
testapp.use(bodyParser.urlencoded({limit: '50mb', extended: true}));
testapp.use(cors());
testapp.use(Express.json());
testapp.use(testrouter);
const server = testapp.listen(3000)

export { testapp, server }

