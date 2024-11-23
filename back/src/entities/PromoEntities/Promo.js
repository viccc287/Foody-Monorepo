import db from "../../database/connection";

class Promo {
    static tableName = "Promo";

    constructor({
        id,
        menuItemId,
        startDate,
        endDate,
        type,
        discount,
        buy_quantity,
        pay_quantity,
        percentage,
        always,
        isActive,
        recurrentDateId,
        name,
    }) {
        this.id = id || null;
        this.menuItemId = menuItemId;
        this.startDate = startDate;
        this.endDate = endDate;
        this.type = type;
        this.discount = discount || 0;
        this.buy_quantity = buy_quantity || null;
        this.pay_quantity = pay_quantity || null;
        this.percentage = percentage || 0;
        this.always = always || false;
        this.isActive = isActive || true;
        this.recurrentDateId = recurrentDateId || null;
        this.name = name;
    }

    static getAll() {
        const stmt = db.prepare(`SELECT * FROM ${this.tableName}`);
        const rows = stmt.all();
        return rows.map((row) => new Promo(row));
    }

    static getById(id) {
        const stmt = db.prepare(`SELECT * FROM ${this.tableName} WHERE id = ?`);
        const row = stmt.get(id);
        return row ? new Promo(row) : null;
    }

    save() {
        if (this.id) {
            return this.#updateRecord();
        } else {
            this.id = this.#createRecord();
            return true;
        }
    }

    #createRecord(){
        const stmt = db.prepare(
            `INSERT INTO ${Promo.tableName} (menuItemId, startDate, endDate, type, discount, buy_quantity, pay_quantity, percentage, always, isActive, recurrentDateId, name)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
        );
        const result = stmt.run(
            this.menuItemId,
            this.startDate,
            this.endDate,
            this.type,
            this.discount,
            this.buy_quantity,
            this.pay_quantity,
            this.percentage,
            this.always ? 1 : 0,
            this.isActive ? 1 : 0,
            this.recurrentDateId,
            this.name
        );
        this.id = result.lastInsertRowid;
        return this.id;
    }

    #updateRecord() {
        const stmt = db.prepare(
            `UPDATE ${Promo.tableName}
            SET menuItemId = ?, startDate = ?, endDate = ?, type = ?, discount = ?, buy_quantity = ?, pay_quantity = ?, percentage = ?, always = ?, isActive = ?, recurrentDateId = ?, name = ?
            WHERE id = ?`
        );
        const result = stmt.run(
            this.menuItemId,
            this.startDate,
            this.endDate,
            this.type,
            this.discount,
            this.buy_quantity,
            this.pay_quantity,
            this.percentage,
            this.always ? 1 : 0,
            this.isActive ? 1 : 0,
            this.recurrentDateId,
            this.name,
            this.id
        );
        return result.changes > 0;
    }

    delete() {
        if (!this.id) throw new Error("Cannot delete an unsaved Promo.");
        const stmt = db.prepare(`DELETE FROM ${Promo.tableName} WHERE id = ?`);
        const result = stmt.run(this.id);
        return result.changes > 0;
    }
}

export default Promo;
