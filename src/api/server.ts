import express from "express";
import crypto from "crypto";
import bodyParser from "body-parser";
import Database from "../persistence/database";
import { IDevice } from "../domain/device";
import { ITransaction } from "../domain/transaction";
import generateKeyPair from "../crypto/generation";
import signECC from "../crypto/ecdsa";
import signRSA from "../crypto/rsa";

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

  console.log("algorithm ", algorithm);

  if (!algorithm) return res.status(404).json({ error: "No algorithm found" });

  if (algorithm !== "ECC" && algorithm !== "RSA")
    return res.status(404).json({ error: "No valid algorithm found" });

  const { publicKey, privateKey } = await generateKeyPair(algorithm);

  const device: IDevice = {
    uuid,
    algorithm,
    publicKey,
    privateKey,
    label: label || "No Label",
    signatureCounter: 0,
    lastSignature: null,
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
  res.json(database.select("device"));
});

server.post("/transaction/:deviceUuid", async (req, res) => {
  const { deviceUuid } = req.params;
  const { dataToBeSigned } = req.body;

  const uuid = crypto.randomUUID();

  const device = database.select("device", deviceUuid);

  if (!device) return res.status(404).json({ error: "No device found" });

  if (!dataToBeSigned)
    return res.status(404).json({ error: "No data to be signed found" });

  const { publicKey, privateKey, signatureCounter, algorithm } = device;

  const keyPair = {
    publicKey,
    privateKey,
  };

  const signature =
    algorithm === "ECC"
      ? Buffer.from(signECC(dataToBeSigned, keyPair)).toString("base64")
      : Buffer.from(signRSA(dataToBeSigned, keyPair)).toString("base64");

  const lastSignatureBase64 =
    device.lastSignature || Buffer.from(deviceUuid).toString("base64");

  const signedData = `${signatureCounter}_${dataToBeSigned}_${lastSignatureBase64}`;

  device.signatureCounter += 1;
  device.lastSignature = signature;
  //
  console.log("device = ", device);
  database.update("device", deviceUuid, device);

  const transaction: ITransaction = {
    uuid,
    signature,
    signedData,
    deviceUuid,
  };

  database.insert("transaction", transaction);

  const response: ITransaction = {
    signature,
    signedData,
  };

  res.json(response);
});

server.get("/transaction", async (req, res) => {
  res.json(database.select("transaction"));
});

export default server;
