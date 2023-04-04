import express from "express";
import bodyParser from "body-parser";
import { deviceRoutes } from "../routes/device.routes";
import { transactionRoutes } from "../routes/transaction.routes";
import { healthRoutes } from "../routes/health.routes";

const server = express();

server.use(bodyParser.json());

server.use(healthRoutes);

// TODO: REST endpoints ...
server.use(deviceRoutes);
server.use(transactionRoutes);

export default server;
