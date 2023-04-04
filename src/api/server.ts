import express from "express";
import bodyParser from "body-parser";
import { deviceRoutes } from "../routes/device.routes";
import { transactionRoutes } from "../routes/transaction.routes";

const server = express();

server.use(bodyParser.json());

server.get("/health", (req, res) => {
  res.status(200);
  res.send(
    JSON.stringify({
      status: "pass",
      version: "v1",
    })
  );
});

// TODO: REST endpoints ...
server.use(deviceRoutes);
server.use(transactionRoutes);

export default server;
