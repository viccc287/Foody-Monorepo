import db from "../../database/connection.js";

class Supplier {
    static tableName = "Supplier";

    constructor({ id, name, phone, email, address }) {
        this.id = id || null;
        this.name = name;
        this.phone = phone || null;
        this.email = email || null;
        this.address = address || null;
    }

    static getAll() {
        const stmt = db.prepare(`SELECT * FROM ${this.tableName} ORDER BY name ASC`);
        const rows = stmt.all();
        return rows.map((row) => new Supplier(row));
    }

    static getById(id) {
        const stmt = db.prepare(`SELECT * FROM ${this.tableName} WHERE id = ?`);
        const row = stmt.get(id);
        return row ? new Supplier(row) : null;
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
            `INSERT INTO ${Supplier.tableName} (name, phone, email, address)
            VALUES (?, ?, ?, ?)`
        );
        const result = stmt.run(this.name, this.phone, this.email, this.address);
        this.id = result.lastInsertRowid;
        return this.id;
    }

    #updateRecord() {
        const stmt = db.prepare(
            `UPDATE ${Supplier.tableName}
            SET name = ?, phone = ?, email = ?, address = ?
            WHERE id = ?`
        );
        const result = stmt.run(this.name, this.phone, this.email, this.address, this.id);
        return result.changes;
    }

    delete() {
        if (!this.id) throw new Error("Cannot delete an unsaved Supplier.");
        const stmt = db.prepare(`DELETE FROM ${Supplier.tableName} WHERE id = ?`);
        const result = stmt.run(this.id);
        return result.changes > 0;
    }
}

export default Supplier;