import db from "../../database/connection";

class OrderItem {
    static tableName = "OrderItem";

    constructor({ id, menuItemId, orderId, promoId, quantity, subtotal, discountApplied, promoName, comments }) {
        this.id = id || null;
        this.menuItemId = menuItemId;
        this.orderId = orderId;
        this.promoId = promoId || null;
        this.quantity = quantity;
        this.subtotal = subtotal;
        this.discountApplied = discountApplied || 0;
        this.promoName = promoName || null;
        this.comments = comments || null;
    }

    static getAll() {
        const stmt = db.prepare(`SELECT * FROM ${this.tableName}`);
        const rows = stmt.all();
        return rows.map((row) => new OrderItem(row));
    }

    static getByOrderId(orderId) {
        const stmt = db.prepare(`SELECT * FROM ${this.tableName} WHERE orderId = ?`);
        const rows = stmt.all(orderId);
        return rows.map((row) => new OrderItem(row));
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
            `INSERT INTO ${OrderItem.tableName} (menuItemId, orderId, promoId, quantity, subtotal, discountApplied, promoName, comments)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
        );
        const result = stmt.run(
            this.menuItemId,
            this.orderId,
            this.promoId,
            this.quantity,
            this.subtotal,
            this.discountApplied,
            this.promoName,
            this.comments
        );
        this.id = result.lastInsertRowid;
        return this.id;
    }

    #updateRecord() {
        const stmt = db.prepare(
            `UPDATE ${OrderItem.tableName}
            SET menuItemId = ?, orderId = ?, promoId = ?, quantity = ?, subtotal = ?, discountApplied = ?, promoName = ?, comments = ?
            WHERE id = ?`
        );
        const result = stmt.run(
            this.menuItemId,
            this.orderId,
            this.promoId,
            this.quantity,
            this.subtotal,
            this.discountApplied,
            this.promoName,
            this.comments,
            this.id
        );
        return result.changes > 0;
    }

    delete() {
        if (!this.id) throw new Error("Cannot delete an unsaved OrderItem.");
        const stmt = db.prepare(`DELETE FROM ${OrderItem.tableName} WHERE id = ?`);
        const result = stmt.run(this.id);
        return result.changes > 0;
    }
}

export default OrderItem;
