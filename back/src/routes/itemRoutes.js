import { Router } from "express";
import db from "../database/connection";

const router = Router();

router.get("/", (req, res) => {
  const stmt = db.prepare("SELECT * FROM Item");
  const items = stmt.all();

  const parsedItems = items.map((item) => ({
    ...item,
    isActive: !!item.isActive, // Convierte 1/0 a true/false
    variablePrice: !!item.variablePrice, // Convierte 1/0 a true/false
    printLocations: JSON.parse(item.printLocations || "[]"), // Parsear JSON
  }));

  res.json(parsedItems);
});

// Add a new item
router.post("/", (req, res) => {
  const {
    name,
    quantity,
    unit,
    isActive,
    family,
    supplier,
    printLocations,
    variablePrice,
    recipe,
    price,
  } = req.body;
  

  const stmt = db.prepare(
    `INSERT INTO Item (name, quantity, unit, isActive, family, supplier, printLocations, variablePrice, recipe, price)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  );

  const result = stmt.run(
    name,
    quantity,
    unit,
    isActive ? 1 : 0,
    family,
    supplier,
    JSON.stringify(printLocations),
    variablePrice ? 1 : 0,
    recipe,
    price
  )

  res.json({ id: result.lastInsertRowid });
  console.log(`Item added by IP ${req.ip} at ${new Date().toLocaleDateString('es-MX')}`);
});

// Update an existing item
router.put("/:id", (req, res) => {
  const { id } = req.params;
  const {
    name,
    quantity,
    unit,
    isActive,
    family,
    supplier,
    printLocations,
    variablePrice,
    recipe,
    price,
  } = req.body;

  const stmt = db.prepare(
    `UPDATE Item
     SET name = ?, quantity = ?, unit = ?, isActive = ?, family = ?, supplier = ?, printLocations = ?, variablePrice = ?, recipe = ?, price = ?
     WHERE id = ?`
  );

  const result = stmt.run(
    name,
    quantity,
    unit,
    isActive ? 1 : 0,
    family,
    supplier,
    JSON.stringify(printLocations),
    variablePrice ? 1 : 0,
    recipe,
    price,
    id
  );

  if (result.changes > 0) {
    res.json({ message: "Item updated successfully" });
  } else {
    res.status(404).json({ error: "Item not found" });
  }
});

router.delete("/:id", (req, res) => {
  const { id } = req.params;

  const stmt = db.prepare("DELETE FROM Item WHERE id = ?");
  const result = stmt.run(id);

  if (result.changes > 0) {
    res.json({ message: "Item deleted successfully" });
  } else {
    res.status(404).json({ error: "Item not found" });
  }
});

export default router;
