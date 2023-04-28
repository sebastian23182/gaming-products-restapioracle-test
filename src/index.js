import Express from "express";
import { router } from "./routes/index.routes.js";
import cors from "cors";
import bodyParser from 'body-parser';
import http from "http"

const app = Express();
const conn = http.createServer(app)
conn.maxConnections = 10000;

app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));

app.use(cors());
app.use(Express.json());
app.use(router);

const server = app.listen(3001);

export { app, server }

