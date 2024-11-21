import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

const dbPath = path.resolve(__dirname, "../../database.sqlite");
const db = new Database(dbPath);

const schemaPath = path.resolve(__dirname, "../../schema.sql");
const schema = fs.readFileSync(schemaPath, "utf8");

db.exec(schema);


export default db;
