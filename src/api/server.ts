import express from "express";
import crypto from "crypto";
import bodyParser from "body-parser";
import Database from "../persistence/database";
import { IDevice } from "../domain/device";
import generateKeyPair from "../crypto/generation";

const server = express();

const database = new Database();

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
server.post("/device", async (req, res) => {
  const { algorithm, label } = req.body;
  const uuid = crypto.randomUUID();

  const { publicKey, privateKey } = await generateKeyPair(algorithm);

  const device = {
    uuid,
    algorithm,
    publicKey,
    privateKey,
    label: label || "No Label",
    signatureCounter: 0,
  };

  database.insert("device", device);

  const response: IDevice = {
    uuid: device.uuid,
    publicKey: device.publicKey,
    algorithm: device.algorithm,
    label: device.label,
    signatureCounter: device.signatureCounter,
  };

  res.json(response);
});

server.get("/device", async (req, res) => {
  const devices = database.select("device");
  res.json(devices);
});

export default server;
