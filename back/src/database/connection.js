import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

const dbPath = path.resolve(__dirname, "../../database.sqlite");
const db = new Database(dbPath);

const schemaPath = path.resolve(__dirname, "../../schema.sql");
const schema = fs.readFileSync(schemaPath, "utf8");

db.exec(schema);

/* const initialMenuItems = [
    {
      name: "Margherita Pizza",
      quantity: 1,
      unit: "pieza",
      isActive: true,
      family: "Alimentos",
      supplier: "Proveedor Genérico",
      printLocations: ["Cocina"],
      variablePrice: false,
      recipe: '',
      price: 150.5,
    },
    {
      name: "Ron con cola",
      quantity: 1,
      unit: "vaso",
      isActive: true,
      family: "Cocteles",
      supplier: "Proveedor Genérico",
      printLocations: [],
      variablePrice: true,
      recipe: '',
      price: 80.0,
    },
    {
      name: "Coca Cola lata",
      quantity: 1,
      unit: "pieza",
      isActive: true,
      family: "Alimentos",
      supplier: "Proveedor Genérico",
      printLocations: ["Caja"],
      variablePrice: false,
      recipe: '',
      price: 40.0,
    },
    {
      name: "Ron Matusalem",
      quantity: 1,
      unit: "botella",
      isActive: true,
      family: "Ron",
      supplier: "Proveedor Genérico",
      printLocations: [],
      variablePrice: false,
      recipe: '',
      price: 525.5,
    },
  ];
  
  // Preparar la sentencia de inserción
  const insertStmt = db.prepare(
    `INSERT INTO Item (name, quantity, unit, isActive, family, supplier, printLocations, variablePrice, recipe, price)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  );
  
  // Insertar cada elemento en la base de datos
  initialMenuItems.forEach((item) => {
    insertStmt.run(
      item.name,
      item.quantity,
      item.unit,
      item.isActive ? 1 : 0,
      item.family,
      item.supplier,
      JSON.stringify(item.printLocations),
      item.variablePrice ? 1 : 0,
      item.recipe,
      item.price
    );
  }); */

export default db;
