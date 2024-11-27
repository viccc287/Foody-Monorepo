import db from "../../database/connection";
import RecurrentDate from "./RecurrentDate"; // Import the RecurrentDate class

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
        this.isActive = !!isActive;
        this.name = name;
    }

    // Fetch all promos
    static getAll() {
        const stmt = db.prepare(`SELECT * FROM ${this.tableName}`);
        const rows = stmt.all();
        return rows.map((row) => new Promo(row));
    }

    // Fetch a promo by ID
    static getById(id) {
        const stmt = db.prepare(`SELECT * FROM ${this.tableName} WHERE id = ?`);
        const row = stmt.get(id);
        return row ? new Promo(row) : null;
    }

    // Fetch all recurrence rules for this promo
    getRecurrenceRules() {
        if (!this.id) throw new Error("Cannot fetch recurrence rules for an unsaved Promo.");
        return RecurrentDate.getByPromoId(this.id);
    }

    // Save or update the promo
    save() {
        if (this.id) {
            return this.#updateRecord();
        } else {
            this.id = this.#createRecord();
            return this.id;
        }
    }

    #createRecord(){
        const stmt = db.prepare(
            `INSERT INTO ${Promo.tableName} (menuItemId, startDate, endDate, type, discount, buy_quantity, pay_quantity, percentage, always, isActive, name)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
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
            this.name
        );
        this.id = result.lastInsertRowid;
        return this.id;
    }

    #updateRecord(){
        const stmt = db.prepare(
            `UPDATE ${Promo.tableName}
            SET menuItemId = ?, startDate = ?, endDate = ?, type = ?, discount = ?, buy_quantity = ?, pay_quantity = ?, percentage = ?, always = ?, isActive = ?, name = ?
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
            this.name,
            this.id
        );
        return result.changes > 0;
    }

    // Delete the promo and all its recurrence rules
    delete() {
        if (!this.id) throw new Error("Cannot delete an unsaved Promo.");

        // First delete all associated recurrence rules
        const recurrenceRules = RecurrentDate.getByPromoId(this.id);
        recurrenceRules.forEach((rule) => rule.delete());

        // Then delete the promo
        const stmt = db.prepare(`DELETE FROM ${Promo.tableName} WHERE id = ?`);
        const result = stmt.run(this.id);
        return result.changes > 0;
    }
}

export default Promo;
