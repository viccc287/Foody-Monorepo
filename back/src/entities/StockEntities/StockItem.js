import db from "../../database/connection";

class StockItem {
    static tableName = "StockItem";

    constructor({ id, name, stock, unit, isActive, family, supplier, cost }) {
        this.id = id || null;
        this.name = name;
        this.stock = stock;
        this.unit = unit;
        this.isActive = isActive || false;
        this.family = family;
        this.supplier = supplier;
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
            return true;
        }
    }

    #createRecord() {
        const stmt = db.prepare(
            `INSERT INTO ${StockItem.tableName} (name, stock, unit, isActive, family, supplier, cost)
            VALUES (?, ?, ?, ?, ?, ?, ?)`
        );
        const result = stmt.run(
            this.name,
            this.stock,
            this.unit,
            this.isActive ? 1 : 0,
            this.family,
            this.supplier,
            this.cost
        );
        this.id = result.lastInsertRowid;
        return this.id;
    }

    #updateRecord() {
        const stmt = db.prepare(
            `UPDATE ${StockItem.tableName}
            SET name = ?, stock = ?, unit = ?, isActive = ?, family = ?, supplier = ?, cost = ?
            WHERE id = ?`
        );
        const result = stmt.run(
            this.name,
            this.stock,
            this.unit,
            this.isActive ? 1 : 0,
            this.family,
            this.supplier,
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
