import db from "../../database/connection.js";

class StockItem {
  static tableName = "StockItem";

  constructor({ id, name, stock, minStock, unit, isActive, categoryId, supplierId, cost }) {
    this.id = id || null;
    this.name = name;
    this.minStock = minStock;
    this.stock = stock;
    this.unit = unit;
    this.isActive = !!isActive;
    this.categoryId = categoryId;
    this.supplierId = supplierId;
    this.cost = cost;
  }

  static getAll() {
    const stmt = db.prepare(`SELECT * FROM ${this.tableName}`);
    const rows = stmt.all();
    return rows.map((row) => new StockItem(row));
  }

  static getById(id) {
    const stmt = db.prepare(`SELECT * FROM ${this.tableName} WHERE id = ?`);
    const row = stmt.get(id);
    return row ? new StockItem(row) : null;
  }

  save() {
    if (this.id) {
      return this.#updateRecord();
    } else {
      this.id = this.#createRecord();
      return this.id;
    }
  }

  #createRecord() {
    const stmt = db.prepare(
      `INSERT INTO ${StockItem.tableName} (name, stock, minStock, unit, isActive, categoryId, supplierId, cost)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    );
    const result = stmt.run(
      this.name,
      this.stock,
      this.minStock,
      this.unit,
      this.isActive ? 1 : 0,
      this.categoryId,
      this.supplierId,
      this.cost
    );
    this.id = result.lastInsertRowid;
    return this.id;
  }

  #updateRecord() {
    const stmt = db.prepare(
      `UPDATE ${StockItem.tableName}
            SET name = ?, stock = ?, minStock = ?, unit = ?, isActive = ?, categoryId = ?, supplierId = ?, cost = ?
            WHERE id = ?`
    );
    const result = stmt.run(
      this.name,
      this.stock,
      this.minStock,
      this.unit,
      this.isActive ? 1 : 0,
      this.categoryId,
      this.supplierId,
      this.cost,
      this.id
    );
    return result.changes > 0;
  }

  delete() {
    if (!this.id) throw new Error("Cannot delete an unsaved StockItem.");
    const stmt = db.prepare(`DELETE FROM ${StockItem.tableName} WHERE id = ?`);
    const result = stmt.run(this.id);
    return result.changes > 0;
  }
}

export default StockItem;
