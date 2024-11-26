import db from "../../database/connection";

class Ingredient {
    static tableName = "Ingredients";

    constructor({ id, menuItemId, inventoryProductId, quantityUsed }) {
        this.id = id || null;
        this.menuItemId = menuItemId;
        this.inventoryProductId = inventoryProductId;
        this.quantityUsed = quantityUsed;
    }

    static getAll() {
        const stmt = db.prepare(`SELECT * FROM ${this.tableName}`);
        const rows = stmt.all();
        return rows.map((row) => new Ingredient(row));
    }

    static getByMenuItemId(menuItemId) {
        const stmt = db.prepare(`SELECT * FROM ${this.tableName} WHERE menuItemId = ?`);
        const rows = stmt.all(menuItemId);
        return rows.map((row) => new Ingredient(row));
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
            `INSERT INTO ${Ingredient.tableName} (menuItemId, inventoryProductId, quantityUsed)
            VALUES (?, ?, ?)`
        );
        const result = stmt.run(
            this.menuItemId,
            this.inventoryProductId,
            this.quantityUsed
        );
        this.id = result.lastInsertRowid;
        return this.id;
    }

    #updateRecord() {
        const stmt = db.prepare(
            `UPDATE ${Ingredient.tableName}
            SET menuItemId = ?, inventoryProductId = ?, quantityUsed = ?
            WHERE id = ?`
        );
        const result = stmt.run(
            this.menuItemId,
            this.inventoryProductId,
            this.quantityUsed,
            this.id
        );
        return result.changes > 0;
    }

    delete() {
        if (!this.id) throw new Error("Cannot delete an unsaved Ingredient.");
        const stmt = db.prepare(`DELETE FROM ${Ingredient.tableName} WHERE id = ?`);
        const result = stmt.run(this.id);
        return result.changes > 0;
    }
}

export default Ingredient;
