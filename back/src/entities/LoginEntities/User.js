import db from "../../database/connection.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
class User {
    static tableName = "User";

    constructor({ id, username, email, password }) {
        this.id = id || null;
        this.username = username;
        this.email = email;
        this.password = password;
    }

    static getAll() {
        const stmt = db.prepare(`SELECT id, username, email FROM ${this.tableName} ORDER BY username ASC`);
        const rows = stmt.all();
        return rows.map((row) => new User(row));
    }

    static getById(id) {
        const stmt = db.prepare(`SELECT id, username, email FROM ${this.tableName} WHERE id = ?`);
        const row = stmt.get(id);
        return row ? new User(row) : null;
    }

    getByUsernameOrEmail(identifier) {
        const stmt = db.prepare(`SELECT * FROM ${this.tableName} WHERE username = ? OR email = ?`);
        const row = stmt.get(identifier, identifier);
        return row ? new User(row) : null;
    }

    async validatePassword(plainPassword) {
        if (!this.password) throw new Error("Password not set for this user.");
        return await bcrypt.compare(plainPassword, this.password);
    }

    async save() {
        if (this.id) {
            return this.#updateRecord();
        } else {
            this.password = await this.#hashPassword(this.password);
            this.id = this.#createRecord();
            return this.id;
        }
    }

    async #hashPassword(password) {
        const saltRounds = 10;
        return await bcrypt.hash(password, saltRounds);
    }

    #createRecord() {
        const stmt = db.prepare(
            `INSERT INTO ${User.tableName} (username, email, password)
            VALUES (?, ?, ?)`
        );
        const result = stmt.run(this.username, this.email, this.password);
        this.id = result.lastInsertRowid;
        return this.id;
    }

    #updateRecord() {
        const stmt = db.prepare(
            `UPDATE ${User.tableName}
            SET username = ?, email = ?, password = ?
            WHERE id = ?`
        );
        const result = stmt.run(this.username, this.email, this.password, this.id);
        return result.changes;
    }

    delete() {
        if (!this.id) throw new Error("Cannot delete an unsaved User.");
        const stmt = db.prepare(`DELETE FROM ${User.tableName} WHERE id = ?`);
        const result = stmt.run(this.id);
        return result.changes > 0;
    }

    static async login(identifier, rawPassword) {
        const user = this.getByUsernameOrEmail(identifier);
        if (!user) throw new Error("User not found.");
        const isValid = await user.validatePassword(rawPassword);
        if (!isValid) throw new Error("Invalid password.");
        return user;
    }

    static getByUsernameOrEmail(identifier) {
        const stmt = db.prepare(`SELECT * FROM ${this.tableName} WHERE username = ? OR email = ?`);
        const row = stmt.get(identifier, identifier);
        return row ? new User(row) : null;
    }
}

export default User;