import db from "../../database/connection";

class RecurrentDate {
  static tableName = "RecurrentDate";

  constructor({ id, promoId, dayOfWeek, startTime, endTime }) {
    this.id = id || null;
    this.promoId = promoId;
    this.dayOfWeek = dayOfWeek;
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

  static getByPromoId(promoId) {
    const stmt = db.prepare(
      `SELECT * FROM ${this.tableName} WHERE promoId = ?`
    );
    const rows = stmt.all(promoId);
    return rows.map((row) => new RecurrentDate(row));
  }

  isNowWithinRule() {
    const now = new Date();
    const dayOfWeekNumber = now.getDay(); // 0 (Domingo) - 6 (Sábado)
    const daysOfWeek = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    const currentDayName = daysOfWeek[dayOfWeekNumber];

    // Verificar si el día actual es el mismo que el de la regla
    if (this.dayOfWeek !== currentDayName) {
      return false;
    }

    // Verificar si la hora actual está dentro del rango de horas
    const [startHour, startMinute] = this.startTime.split(":").map(Number);
    const [endHour, endMinute] = this.endTime.split(":").map(Number);

    const startDateTime = new Date(now);
    startDateTime.setHours(startHour, startMinute, 0, 0);

    const endDateTime = new Date(now);
    endDateTime.setHours(endHour, endMinute, 0, 0);

    // Manejar casos donde el rango de tiempo cruza la medianoche
    if (endDateTime <= startDateTime) {
      // Si el rango cruza la medianoche, ajustamos el endDateTime al día siguiente
      endDateTime.setDate(endDateTime.getDate() + 1);
    }

    return now >= startDateTime && now <= endDateTime;
  }

  isTimeWithinRule(checkTime) {
    const dayOfWeekNumber = checkTime.getDay(); // 0 (Sunday) - 6 (Saturday)
    const daysOfWeek = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    const currentDayName = daysOfWeek[dayOfWeekNumber];

    // Check if the day matches
    if (this.dayOfWeek !== currentDayName) {
      return false;
    }

    // Check if the time is within the range
    const [startHour, startMinute] = this.startTime.split(":").map(Number);
    const [endHour, endMinute] = this.endTime.split(":").map(Number);

    const startDateTime = new Date(checkTime);
    startDateTime.setHours(startHour, startMinute, 0, 0);

    const endDateTime = new Date(checkTime);
    endDateTime.setHours(endHour, endMinute, 0, 0);

    // Handle cases where the time range crosses midnight
    if (endDateTime <= startDateTime) {
      endDateTime.setDate(endDateTime.getDate() + 1);
    }

    return checkTime >= startDateTime && checkTime <= endDateTime;
  }

  save() {
    if (this.id) {
      const stmt = db.prepare(
        `UPDATE ${RecurrentDate.tableName}
                SET promoId = ?, dayOfWeek = ?, startTime = ?, endTime = ?
                WHERE id = ?`
      );
      const result = stmt.run(
        this.promoId,
        this.dayOfWeek,
        this.startTime,
        this.endTime,
        this.id
      );
      return result.changes > 0;
    } else {
      const stmt = db.prepare(
        `INSERT INTO ${RecurrentDate.tableName} (promoId, dayOfWeek, startTime, endTime)
                VALUES (?, ?, ?, ?)`
      );
      const result = stmt.run(
        this.promoId,
        this.dayOfWeek,
        this.startTime,
        this.endTime
      );
      this.id = result.lastInsertRowid;
      return this.id;
    }
  }

  delete() {
    if (!this.id) throw new Error("Cannot delete an unsaved RecurrentDate.");
    const stmt = db.prepare(
      `DELETE FROM ${RecurrentDate.tableName} WHERE id = ?`
    );
    const result = stmt.run(this.id);
    return result.changes > 0;
  }
}

export default RecurrentDate;
