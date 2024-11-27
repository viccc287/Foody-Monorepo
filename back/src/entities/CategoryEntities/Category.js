// FILE: Category.js

import db from "../../database/connection";

class Category {
    static tableName = "Category";

    constructor({ id, name, description, type }) {
        this.id = id || null;
        this.name = name;
        this.description = description;
        this.type = type; // 'menu' or 'stock'
    }

    static getAll() {
        const stmt = db.prepare(`SELECT * FROM ${this.tableName} ORDER BY name ASC`);
        const rows = stmt.all();
        return rows.map((row) => new Category(row));
    }

    static getById(id) {
        const stmt = db.prepare(`SELECT * FROM ${this.tableName} WHERE id = ?`);
        const row = stmt.get(id);
        return row ? new Category(row) : null;
    }
    static getAllByType(type) {
        const stmt = db.prepare(`SELECT * FROM ${this.tableName} WHERE type = ? ORDER BY name ASC`);
        const rows = stmt.all(type);
        return rows.map((row) => new Category(row));
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
            `INSERT INTO ${Category.tableName} (name, description, type)
            VALUES (?, ?, ?)`
        );
        const result = stmt.run(this.name, this.description, this.type);
        this.id = result.lastInsertRowid;
        return this.id;
    }

    #updateRecord() {
        const stmt = db.prepare(
            `UPDATE ${Category.tableName}
            SET name = ?, description = ?, type = ?
            WHERE id = ?`
        );
        const result = stmt.run(this.name, this.description, this.type, this.id);
        return result.changes;
    }

    delete() {
        if (!this.id) throw new Error("Cannot delete an unsaved Category.");
        const stmt = db.prepare(`DELETE FROM ${Category.tableName} WHERE id = ?`);
        const result = stmt.run(this.id);
        return result.changes > 0;
    }
}

export default Category;