// TODO: signature device domain model ...

export type IAlgorithm = "ECC" | "RSA";
export interface IDevice {
  uuid: string;
  algorithm: IAlgorithm;
  label?: string;
  privateKey?: string;
  publicKey: string;
  signatureCounter: number;
  lastSignature?: string | null;
}
