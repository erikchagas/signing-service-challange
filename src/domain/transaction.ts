export interface ITransaction {
  uuid?: string;
  signature: string;
  signedData: string;
  deviceUuid?: string;
}
