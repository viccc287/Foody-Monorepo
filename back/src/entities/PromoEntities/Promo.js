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
    this.discount = discount || null;
    this.buy_quantity = buy_quantity || null;
    this.pay_quantity = pay_quantity || null;
    this.percentage = percentage || null;
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

  static getActiveByMenuItemId(menuItemId) {
    const stmt = db.prepare(
      `SELECT * FROM ${this.tableName} WHERE menuItemId = ? AND isActive = 1`
    );
    const rows = stmt.all(menuItemId);
    const promos = rows.map((row) => new Promo(row));

    // Filtrar las promociones que están activas actualmente
    const activePromos = promos.filter((promo) => promo.isCurrentlyActive());
    return activePromos;
  }

  static getByMenuItemId(menuItemId) {
    const stmt = db.prepare(
      `SELECT * FROM ${this.tableName} WHERE menuItemId = ?`
    );
    const row = stmt.get(menuItemId);
    return row ? new Promo(row) : null;
  }

  isCurrentlyActive() {
    const now = new Date();

    // Verificar si la promoción está dentro de las fechas de inicio y fin
    if (this.startDate && now < new Date(this.startDate)) {
      return false;
    }
    if (this.endDate && now > new Date(this.endDate)) {
      return false;
    }

    // Si la promoción es 'always', está siempre activa
    if (this.always) {
      return true;
    }

    // Verificar reglas de recurrencia
    const recurrenceRules = this.getRecurrenceRules();
    return recurrenceRules.some((rule) => rule.isNowWithinRule());
  }

  isValidAtTimestamp(timestamp) {
    const checkTime = new Date(timestamp);

    // Check if within promo period
    if (this.startDate && checkTime < new Date(this.startDate)) return false;
    if (this.endDate && checkTime > new Date(this.endDate)) return false;

    // Check if always valid
    if (this.always) return true;

    // Check recurrence rules
    const rules = this.getRecurrenceRules();
    return rules.some((rule) => rule.isTimeWithinRule(checkTime));
  }

  calculateDiscount(quantity, subtotal, menuItemPrice) {
    let discount = 0;
    if (this.type === "percentage_discount") {
      discount = subtotal * (this.percentage / 100);
    } else if (this.type === "buy_x_get_y") {
      const freeItemsPerCycle = this.buy_quantity - this.pay_quantity;
      const cycles = Math.floor(quantity / this.buy_quantity);

      const freeItems = cycles * freeItemsPerCycle;

      discount = freeItems * menuItemPrice;
    } else if (this.type === "price_discount") {
      discount = this.discount * quantity;
    }
    return discount;
  }

  // Fetch all recurrence rules for this promo
  getRecurrenceRules() {
    if (!this.id)
      throw new Error("Cannot fetch recurrence rules for an unsaved Promo.");
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

  #createRecord() {
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

  #updateRecord() {
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
