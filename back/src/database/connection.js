import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

const __dirname = path.resolve();
const dbPath = path.resolve(__dirname, "./database.sqlite");
const schemaPath = path.resolve(__dirname, "./schema.sql");

let db;

try {
  const dbExists = fs.existsSync(dbPath);
  db = new Database(dbPath);
  
  // Only create tables if database is new
  if (!dbExists) {
    console.log('Creating new database with schema...');
    const schema = fs.readFileSync(schemaPath, "utf8");
    db.exec(schema);
  }
} catch (error) {
  console.error('Database initialization error:', error);
  throw error;
}

export default db;