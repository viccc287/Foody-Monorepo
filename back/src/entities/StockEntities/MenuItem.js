import db from "../../database/connection";

class MenuItem {
  static tableName = "MenuItem";

  constructor({
    id,
    name,
    quantity,
    unit,
    isActive,
    categoryId,
    printLocations,
    variablePrice,
    price,
  }) {
    this.id = id || null;
    this.name = name;
    this.quantity = quantity;
    this.unit = unit;
    this.isActive = !!isActive;
    this.categoryId = categoryId;
    this.printLocations = Array.isArray(printLocations)
      ? printLocations
      : JSON.parse(printLocations || "[]");
    this.variablePrice = variablePrice || false;
    this.price = price;
  }

  static getAll() {
    const stmt = db.prepare(`SELECT * FROM ${this.tableName}`);
    const rows = stmt.all();
    return rows.map((row) => new MenuItem(row));
  }

  static getById(id) {
    const stmt = db.prepare(`SELECT * FROM ${this.tableName} WHERE id = ?`);
    const row = stmt.get(id);
    return row ? new MenuItem(row) : null;
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
      `INSERT INTO ${MenuItem.tableName} (name, quantity, unit, isActive, categoryId, printLocations, variablePrice, price)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    );
    const result = stmt.run(
      this.name,
      this.quantity,
      this.unit,
      this.isActive ? 1 : 0,
      this.categoryId,
      JSON.stringify(this.printLocations),
      this.variablePrice ? 1 : 0,
      this.price
    );
    this.id = result.lastInsertRowid;
    return this.id;
  }

  #updateRecord() {
    const stmt = db.prepare(
      `UPDATE ${MenuItem.tableName}
            SET name = ?, quantity = ?, unit = ?, isActive = ?, categoryId = ?, printLocations = ?, variablePrice = ?, price = ?
            WHERE id = ?`
    );
    const result = stmt.run(
      this.name,
      this.quantity,
      this.unit,
      this.isActive ? 1 : 0,
      this.categoryId,
      JSON.stringify(this.printLocations),
      this.variablePrice ? 1 : 0,
      this.price,
      this.id
    );
    return result.changes;
  }

  // Delete the menu item
  delete() {
    if (!this.id) throw new Error("Cannot delete an unsaved MenuItem.");
    const stmt = db.prepare(`DELETE FROM ${MenuItem.tableName} WHERE id = ?`);
    const result = stmt.run(this.id);
    return result.changes > 0;
  }
}

export default MenuItem;
