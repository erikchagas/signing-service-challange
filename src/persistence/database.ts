// TODO: in-memory persistence ...
import fs from "node:fs/promises";
import path from "node:path";

const databasePath = path.join(__dirname, "db.json");

export default class Database {
  database: any = {};

  constructor() {
    fs.readFile(databasePath, "utf8")
      .then((data) => {
        this.database = JSON.parse(data);
      })
      .catch(() => {
        this.persist();
      });
  }

  persist() {
    fs.writeFile(databasePath, JSON.stringify(this.database));
  }

  select(table: string, uuid?: string) {
    let data = this.database[table] ?? [];

    if (uuid) {
      data = data.find((row: any) => row.uuid === uuid);
    }

    return data;
  }

  insert(table: string, data: any) {
    if (Array.isArray(this.database[table])) {
      this.database[table].push(data);
    } else {
      this.database[table] = [data];
    }

    this.persist();

    return data;
  }

  update(table: string, uuid: string, data: any) {
    const rowIndex = this.database[table].findIndex(
      (row: any) => row.uuid === uuid
    );

    if (rowIndex > -1) {
      this.database[table][rowIndex] = { uuid, ...data };
      this.persist();
    }
  }

  delete(table: string, uuid: string) {
    const rowIndex = this.database[table].findIndex(
      (row: any) => row.uuid === uuid
    );

    if (rowIndex > -1) {
      this.database[table].splice(rowIndex, 1);
      this.persist();
    }
  }
}
