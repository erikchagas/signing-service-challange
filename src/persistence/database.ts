// TODO: in-memory persistence ...
import fs from "node:fs/promises";
import { IDevice } from "../domain/device";
import path from "node:path";

type IEntity = "device";
interface IDatabase {
  device?: [IDevice?];
}

const databasePath = path.join(__dirname, "db.json");

export default class Database {
  database: IDatabase = {};

  constructor() {
    console.log("databasePath", databasePath);
    fs.readFile(databasePath, "utf8")
      .then((data) => {
        console.log("readFile", data);

        this.database = JSON.parse(data);
      })
      .catch(() => {
        this.persist();
      });
  }

  persist() {
    fs.writeFile(databasePath, JSON.stringify(this.database));
  }

  select(table: IEntity) {
    const data = this.database[table] ?? [];

    return data;
  }

  insert(table: IEntity, data: IDevice) {
    if (Array.isArray(this.database[table])) {
      this.database[table]?.push(data);
    } else {
      this.database[table] = [data];
    }

    this.persist();

    return data;
  }
}
