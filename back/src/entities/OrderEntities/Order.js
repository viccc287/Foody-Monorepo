import db from "../../database/connection.js";
import OrderItem from "./OrderItem.js";

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
    updatedAt,
    paymentMethod,
    cancelledAt,
    cancelReason,
    status,
    claimedById,
    billedById,
    billedAt,
    ready,
  }) {
    this.id = id || null;
    this.customer = customer;
    this.subtotal = subtotal || 0;
    this.discountTotal = discountTotal || 0;
    this.total = total || 0;
    this.tip = tip || 0;
    this.createdAt = createdAt || null;
    this.updatedAt = updatedAt || null;
    this.paymentMethod = paymentMethod || null;
    this.cancelledAt = cancelledAt || null;
    this.cancelReason = cancelReason || null;
    this.status = status || "active";
    this.claimedById = claimedById || null;
    this.billedById = billedById || null;
    this.billedAt = billedAt || null;
    this.ready = !!ready;
  }

  static getAll() {
    const stmt = db.prepare(`SELECT * FROM ${this.tableName}`);
    const rows = stmt.all();

    return rows.map((row) => new Order(row));
  }

  static getAllPaginated(
    offset = 0,
    limit = -1,
    startDate = null,
    endDate = null
  ) {
    let query = `SELECT * FROM ${this.tableName}`;
    let params = [];
    let whereClause = [];

    if (startDate) {
      whereClause.push("createdAt >= ?");
      params.push(startDate);
    }

    if (endDate) {
      whereClause.push("createdAt <= ?");
      params.push(endDate);
    }

    if (whereClause.length > 0) {
      query += ` WHERE ${whereClause.join(" AND ")}`;
    }

    query += " ORDER BY createdAt DESC";

    let countQuery = `SELECT COUNT(*) as total FROM ${this.tableName}`;
    if (whereClause.length > 0) {
      countQuery += ` WHERE ${whereClause.join(" AND ")}`;
    }

    let rows;
    if (limit !== -1) {
      query += " LIMIT ? OFFSET ?";
      rows = db.prepare(query).all(...params, limit, offset);
    } else {
      rows = db.prepare(query).all(...params);
    }

    const { total } = db.prepare(countQuery).get(...params);

    const orders = rows.map((row) => new Order(row));

    return { orders, total };
  }

  static getTotalSales(startDate = null, endDate = null) {
    let query = `
      SELECT 
        COUNT(*) as orderCount,
        SUM(total) as totalSales,
        SUM(tip) as totalTips,
        SUM(discountTotal) as totalDiscounts
      FROM ${this.tableName}
      WHERE status != 'cancelled' AND status != 'unpaid'
    `;
    let params = [];

    if (startDate) {
      query += " AND createdAt >= ?";
      params.push(startDate);
    }

    if (endDate) {
      query += " AND createdAt <= ?";
      params.push(endDate);
    }

    const stmt = db.prepare(query);
    const result = stmt.get(...params);

    return result;
  }

  static getDashboardStats(startDate = null, endDate = null) {
    let params = [];
    let dateFilter = "";

    if (startDate) {
      dateFilter += " AND createdAt >= ?";
      params.push(startDate);
    }

    if (endDate) {
      dateFilter += " AND createdAt <= ?";
      params.push(endDate);
    }

    // Main stats query
    const query = `
    SELECT 
      SUM(CASE WHEN o.status = 'active' THEN 1 ELSE 0 END) as activeOrders,
      SUM(CASE WHEN o.status = 'cancelled' THEN 1 ELSE 0 END) as cancelledOrders,
      SUM(CASE WHEN o.status = 'paid' THEN 1 ELSE 0 END) as completedOrders,
      SUM(o.total) as totalSales,
      SUM(o.tip) as totalTips,
      SUM(o.discountTotal) as totalDiscounts,
      COUNT(*) as orderCount,
      AVG(o.total) as averageOrderValue,
      AVG(
        (JULIANDAY(o.billedAt) - JULIANDAY(o.createdAt)) * 24 * 60
      ) as averageTimeBetweenCreatedAndBilled
    FROM "Order" o
    WHERE o.status NOT IN ('unpaid')
      ${dateFilter.replace(/createdAt/g, "o.createdAt")}
  `;

    const hourlyQuery = `
    SELECT 
      strftime('%H:00', datetime(o.createdAt, 'localtime')) as hour,
      COUNT(*) as orderCount
    FROM "Order" o
    WHERE o.status NOT IN ('cancelled', 'unpaid')
      ${dateFilter.replace(/createdAt/g, "o.createdAt")}
    GROUP BY hour
    ORDER BY hour ASC
  `;

    const topItemsQuery = `
    SELECT 
      m.name as itemName,
      SUM(oi.quantity) as totalQuantity,
      SUM(oi.total) as totalRevenue
    FROM OrderItem oi
    JOIN MenuItem m ON oi.menuItemId = m.id
    JOIN "Order" o ON oi.orderId = o.id
    WHERE o.status NOT IN ('cancelled', 'unpaid')
      ${dateFilter.replace(/createdAt/g, "o.createdAt")}
    GROUP BY oi.menuItemId
    ORDER BY totalQuantity DESC
    LIMIT 5
  `;

    const mainStats = db.prepare(query).get(...params);
    const hourlyDistribution = db.prepare(hourlyQuery).all(...params);
    const topItems = db.prepare(topItemsQuery).all(...params);

    return {
      activeOrders: mainStats.activeOrders || 0,
      cancelledOrders: mainStats.cancelledOrders || 0,
      completedOrders: mainStats.completedOrders || 0,
      totalSales: mainStats.totalSales || 0,
      totalTips: mainStats.totalTips || 0,
      totalDiscounts: mainStats.totalDiscounts || 0,
      orderCount: mainStats.orderCount || 0,
      averageOrderValue:
        Math.round((mainStats.averageOrderValue || 0) * 100) / 100,
      conversionRate: mainStats.totalOrders
        ? parseFloat(
            ((mainStats.completedOrders / mainStats.totalOrders) * 100).toFixed(
              2
            )
          )
        : 0,
      averageTimeBetweenCreatedAndBilled:
        Math.round((mainStats.averageTimeBetweenCreatedAndBilled || 0) * 100) /
        100,
      hourlyDistribution,
      topSellingItems: topItems.map((item) => ({
        name: item.itemName,
        quantity: item.totalQuantity,
        revenue: item.totalRevenue,
      })),
      period: {
        startDate: startDate || "all time",
        endDate: endDate || "now",
      },
    };
  }

  static getByStatus(status) {
    const stmt = db.prepare(`SELECT * FROM ${this.tableName} WHERE status = ?`);
    const rows = stmt.all(status);
    return rows.map((row) => new Order(row));
  }

  static getActiveByClaimedId(claimedById) {
    const stmt = db.prepare(
      `SELECT * FROM ${this.tableName} WHERE claimedById = ? AND status = 'active'`
    );
    const rows = stmt.all(claimedById);
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
      `INSERT INTO ${Order.tableName} (customer, subtotal, discountTotal, total, tip, paymentMethod, status, claimedById, billedById, billedAt, createdAt, updatedAt, ready)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
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
      this.billedById,
      this.billedAt,
      this.createdAt,
      this.updatedAt,
      this.ready ? 1 : 0
    );
    this.id = result.lastInsertRowid;
    return this.id;
  }

  #updateRecord() {
    const stmt = db.prepare(
      `UPDATE ${Order.tableName}
            SET customer = ?, subtotal = ?, discountTotal = ?, total = ?, tip = ?, paymentMethod = ?, cancelledAt = ?, cancelReason = ?, status = ?, claimedById = ?, billedById = ?, billedAt = ?, createdAt = ?, updatedAt = ?, ready = ?
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
      this.billedAt,
      this.createdAt,
      this.updatedAt,
      this.ready ? 1 : 0,
      this.id
    );
    return result.changes > 0;
  }

  getEnhancedOrder() {
    const orderItems = OrderItem.getByOrderId(this.id);

    let subtotal = 0;
    let discountTotal = 0;

    orderItems.forEach((item) => {
      subtotal += item.subtotal;
      discountTotal += item.discountApplied;
    });

    const total = subtotal - discountTotal < 0 ? 0 : subtotal - discountTotal;

    return {
      ...this,
      orderItems,
      subtotal,
      discountTotal,
      total,
    };
  }

  updateTotals() {
    const orderItems = OrderItem.getByOrderId(this.id);

    let subtotal = 0;
    let discountTotal = 0;

    orderItems.forEach((item) => {
      subtotal += item.subtotal;
      discountTotal += item.discountApplied;
    });

    this.subtotal = subtotal;
    this.discountTotal = discountTotal;
    this.total = subtotal - discountTotal < 0 ? 0 : subtotal - discountTotal;
  }

  delete() {
    if (!this.id) throw new Error("Cannot delete an unsaved Order.");
    const stmt = db.prepare(`DELETE FROM ${Order.tableName} WHERE id = ?`);
    const result = stmt.run(this.id);
    return result.changes > 0;
  }
}

export default Order;
