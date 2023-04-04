import { Router } from "express";
import crypto from "crypto";
import { ITransaction } from "../domain/transaction";

import signECC from "../crypto/ecdsa";
import signRSA from "../crypto/rsa";

import Database from "../persistence/database";

const database = new Database();
const transactionRoutes = Router();

transactionRoutes.post("/transaction/:deviceUuid", async (req, res) => {
  const { deviceUuid } = req.params;
  const { dataToBeSigned } = req.body;

  const uuid = crypto.randomUUID();

  const device = database.select("device", deviceUuid);

  console.log("device = ", device);

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

transactionRoutes.get("/transaction", async (req, res) => {
  res.json(database.select("transaction"));
});

export { transactionRoutes };