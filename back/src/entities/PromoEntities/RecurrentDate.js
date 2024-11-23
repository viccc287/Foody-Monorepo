import db from "../../database/connection";

class RecurrentDate {
    static tableName = "RecurrentDate";

    constructor({ id, days_of_week, startTime, endTime }) {
        this.id = id || null;
        this.days_of_week = days_of_week;
        this.startTime = startTime;
        this.endTime = endTime;
    }

    static getAll() {
        const stmt = db.prepare(`SELECT * FROM ${this.tableName}`);
        const rows = stmt.all();
        return rows.map((row) => new RecurrentDate(row));
    }

    static getById(id) {
        const stmt = db.prepare(`SELECT * FROM ${this.tableName} WHERE id = ?`);
        const row = stmt.get(id);
        return row ? new RecurrentDate(row) : null;
    }

    save() {
        if (this.id) {
            const stmt = db.prepare(
                `UPDATE ${RecurrentDate.tableName}
                SET days_of_week = ?, startTime = ?, endTime = ?
                WHERE id = ?`
            );
            const result = stmt.run(this.days_of_week, this.startTime, this.endTime, this.id);
            return result.changes > 0;
        } else {
            const stmt = db.prepare(
                `INSERT INTO ${RecurrentDate.tableName} (days_of_week, startTime, endTime)
                VALUES (?, ?, ?)`
            );
            const result = stmt.run(this.days_of_week, this.startTime, this.endTime);
            this.id = result.lastInsertRowid;
            return this.id;
        }
    }

    delete() {
        if (!this.id) throw new Error("Cannot delete an unsaved RecurrentDate.");
        const stmt = db.prepare(`DELETE FROM ${RecurrentDate.tableName} WHERE id = ?`);
        const result = stmt.run(this.id);
        return result.changes > 0;
    }
}

export default RecurrentDate;
