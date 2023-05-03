import Express from "express";
import { router } from "./routes/index.routes.js";
import cors from "cors";
import bodyParser from 'body-parser';
import http from "http";
import cluster from "cluster";
import os from "os"

const numCPUs = os.cpus().length;
if(cluster.isPrimary){
    for(let i = 0; i < numCPUs; i++){
        cluster.fork();
    }
}else{
    const app = Express();
    const conn = http.createServer(app)
    conn.maxConnections = 20000;

    app.use(bodyParser.json({limit: '50mb'}));
    app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));

    app.use(cors());
    app.use(Express.json());
    app.use(router);

    app.listen(3001);
}




