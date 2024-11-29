import db from "../../database/connection.js";

class Agent {
    static tableName = "Agent";

    constructor({ id, name, lastName, image, address, phone, rfc, email, pin, role, isActive }) {
        this.id = id || null;
        this.name = name;
        this.lastName = lastName;
        this.image = image || null;
        this.address = address;
        this.phone = phone;
        this.rfc = rfc;
        this.email = email;
        this.pin = pin;
        this.role = role;
        this.isActive = isActive !== undefined ? isActive : 1;
    }

    static getAll() {
        const stmt = db.prepare(`SELECT id, name, lastName, email, role, isActive FROM ${this.tableName} ORDER BY name ASC`);
        const rows = stmt.all();
        return rows.map((row) => new Agent(row));
    }

    static getById(id) {
        const stmt = db.prepare(`SELECT * FROM ${this.tableName} WHERE id = ?`);
        const row = stmt.get(id);
        return row ? new Agent(row) : null;
    }

    static getByEmail(email) {
        const stmt = db.prepare(`SELECT * FROM ${this.tableName} WHERE email = ?`);
        const row = stmt.get(email);
        return row ? new Agent(row) : null;
    }

    async save() {
        if (this.id) {
            return this.#updateRecord();
        } else {
            this.id = this.#createRecord();
            return this.id;
        }
    }

    #createRecord() {
        const stmt = db.prepare(
            `INSERT INTO ${Agent.tableName} (name, lastName, image, address, phone, rfc, email, pin, role, isActive)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
        );
        const result = stmt.run(this.name, this.lastName, this.image, this.address, this.phone, this.rfc, this.email, this.pin, this.role, this.isActive);
        this.id = result.lastInsertRowid;
        return this.id;
    }

    #updateRecord() {
        const stmt = db.prepare(
            `UPDATE ${Agent.tableName}
            SET name = ?, lastName = ?, image = ?, address = ?, phone = ?, rfc = ?, email = ?, pin = ?, role = ?, isActive = ?
            WHERE id = ?`
        );
        const result = stmt.run(this.name, this.lastName, this.image, this.address, this.phone, this.rfc, this.email, this.pin, this.role, this.isActive, this.id);
        return result.changes;
    }

    delete() {
        if (!this.id) throw new Error("Cannot delete an unsaved Agent.");
        const stmt = db.prepare(`DELETE FROM ${Agent.tableName} WHERE id = ?`);
        const result = stmt.run(this.id);
        return result.changes > 0;
    }

    static async authenticate(email, pin) {
        const agent = this.getByEmail(email);
        if (!agent) return null;
        if (agent.pin !== pin) return null;
        return agent;
    }
}

export default Agent;