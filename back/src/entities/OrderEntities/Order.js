import db from "../../database/connection";

class Order {
  static tableName = '"Order"';

  constructor({
    id,
    customer,
    subtotal,
    discountTotal,
    total,
    tip,
    createdAt,
    paymentMethod,
    cancelledAt,
    cancelReason,
    status,
    claimedById,
    billedById,
  }) {
    this.id = id || null;
    this.customer = customer;
    this.subtotal = subtotal || 0;
    this.discountTotal = discountTotal || 0;
    this.total = total || 0;
    this.tip = tip || 0;
    this.createdAt = createdAt || new Date().toISOString();
    this.paymentMethod = paymentMethod || null;
    this.cancelledAt = cancelledAt || null;
    this.cancelReason = cancelReason || null;
    this.status = status || "active";
    this.claimedById = claimedById || null;
    this.billedById = billedById || null;
  }

  static getAll() {
    const stmt = db.prepare(`SELECT * FROM ${this.tableName}`);
    const rows = stmt.all();
    return rows.map((row) => new Order(row));
  }

  static getByStatus(status) {
    const stmt = db.prepare(`SELECT * FROM ${this.tableName} WHERE status = ?`);
    const rows = stmt.all(status);
    return rows.map((row) => new Order(row));
  }

  static getById(id) {
    const stmt = db.prepare(`SELECT * FROM ${this.tableName} WHERE id = ?`);
    const row = stmt.get(id);
    return row ? new Order(row) : null;
  }

  static getByCustomer(customer) {
    const stmt = db.prepare(
      `SELECT * FROM ${this.tableName} WHERE customer = ?`
    );
    const rows = stmt.all(customer);
    return rows.map((row) => new Order(row));
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
      `INSERT INTO ${Order.tableName} (customer, subtotal, discountTotal, total, tip, paymentMethod, status, claimedById, billedById)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    );
    const result = stmt.run(
      this.customer,
      this.subtotal,
      this.discountTotal,
      this.total,
      this.tip,
      this.paymentMethod,
      this.status,
      this.claimedById,
      this.billedById
    );
    this.id = result.lastInsertRowid;
    return this.id;
  }

  #updateRecord() {
    const stmt = db.prepare(
      `UPDATE ${Order.tableName}
            SET customer = ?, subtotal = ?, discountTotal = ?, total = ?, tip = ?, paymentMethod = ?, cancelledAt = ?, cancelReason = ?, status = ?, claimedById = ?, billedById = ?
            WHERE id = ?`
    );
    const result = stmt.run(
      this.customer,
      this.subtotal,
      this.discountTotal,
      this.total,
      this.tip,
      this.paymentMethod,
      this.cancelledAt,
      this.cancelReason,
      this.status,
      this.claimedById,
      this.billedById,
      this.id
    );
    return result.changes > 0;
  }

  delete() {
    if (!this.id) throw new Error("Cannot delete an unsaved Order.");
    const stmt = db.prepare(`DELETE FROM ${Order.tableName} WHERE id = ?`);
    const result = stmt.run(this.id);
    return result.changes > 0;
  }
}

export default Order;
