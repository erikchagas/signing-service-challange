import { Router } from "express";
import crypto from "crypto";
import { IDevice } from "../domain/device";
import generateKeyPair from "../crypto/generation";
import Database from "../persistence/database";

const database = new Database();
const deviceRoutes = Router();

deviceRoutes.post("/device", async (req, res) => {
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

deviceRoutes.get("/device", async (req, res) => {
  res.json(database.select("device"));
});

export { deviceRoutes };
