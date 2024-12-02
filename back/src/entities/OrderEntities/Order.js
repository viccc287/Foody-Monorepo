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
    cancelledById,
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
    this.cancelledById = cancelledById || null;
    this.cancelledAt = cancelledAt || null;
    this.cancelReason = cancelReason || null;
    this.status = status || "active";
    this.claimedById = claimedById || null;
    this.billedById = billedById || null;
    this.billedAt = billedAt || null;
    this.ready = !!ready;
  }

  static getAll() {
    const stmt = db.prepare(`SELECT * FROM ${this.tableName} ORDER BY createdAt DESC`);
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

    query += " ORDER BY updatedAt DESC";

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

  static getDashboardStats(
    startDate = null,
    endDate = null,
    claimedById = null
  ) {
    let params = [];
    let dateFilter = "";
    let claimedByFilter = "";

    if (startDate) {
      dateFilter += " AND o.createdAt >= ?";
      params.push(startDate);
    }

    if (endDate) {
      dateFilter += " AND o.createdAt <= ?";
      params.push(endDate);
    }

    if (claimedById) {
      claimedByFilter = " AND o.claimedById = ?";
      params.push(claimedById);
    }

    const mainStatsQuery = `
  WITH 
  FilteredOrders AS (
    SELECT *
    FROM "Order" o 
    WHERE o.status NOT IN ('cancelled','unpaid')
      ${dateFilter}
      ${claimedByFilter}
  )
  SELECT 
    SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as activeOrders,
    SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelledOrders,
    SUM(CASE WHEN status = 'paid' THEN 1 ELSE 0 END) as completedOrders,
    SUM(total) as totalSales,
    SUM(tip) as totalTips,
    SUM(discountTotal) as totalDiscounts,
    COUNT(*) as orderCount,
    AVG(total) as averageOrderValue,
    AVG(
      (JULIANDAY(billedAt) - JULIANDAY(createdAt)) * 24 * 60
    ) as averageTimeBetweenCreatedAndBilled
  FROM FilteredOrders
`;

    const hourlyQuery = `
    SELECT 
      strftime('%H:00', datetime(o.createdAt, 'localtime')) as hour,
      COUNT(*) as orderCount
    FROM "Order" o
    WHERE o.status NOT IN ('cancelled', 'unpaid')
      ${dateFilter}
      ${claimedByFilter}
    GROUP BY hour
    ORDER BY hour ASC
  `;

    const historicTotalsQuery = `
  SELECT 
    COUNT(*) as orderCount,
    COALESCE(SUM(total), 0) totalSales,
    COALESCE(SUM(tip), 0) as totalTips,
    COALESCE(SUM(discountTotal), 0) as totalDiscounts
  FROM "Order" o
  WHERE status NOT IN ('cancelled', 'unpaid')
    ${claimedByFilter}
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
      ${dateFilter}
      ${claimedByFilter}
    GROUP BY oi.menuItemId
    ORDER BY totalQuantity DESC
    LIMIT 5
  `;

    const salesAggregationQuery = `
  WITH DateRanges AS (
    SELECT 
      MIN(o.createdAt) as earliest_date,
      MAX(o.createdAt) as latest_date,
      (JULIANDAY(MAX(o.createdAt)) - JULIANDAY(MIN(o.createdAt))) as date_diff_days
    FROM "Order" o
    WHERE o.status NOT IN ('cancelled', 'unpaid')
      ${dateFilter}
      ${claimedByFilter}
  )
  SELECT 
    CASE 
      WHEN (SELECT date_diff_days FROM DateRanges) <= 31 THEN
        date(o.createdAt, 'localtime')
      WHEN (SELECT date_diff_days FROM DateRanges) <= 182 THEN
        date(o.createdAt, 'localtime', 'weekday 0', '-7 days')
      WHEN (SELECT date_diff_days FROM DateRanges) <= 730 THEN
        date(o.createdAt, 'localtime', 'start of month')
      ELSE
        date(o.createdAt, 'localtime', 'start of year')
    END as period_start,
    COUNT(*) as order_count,
    SUM(o.total) as total_sales,
    SUM(o.tip) as total_tips,
    SUM(o.discountTotal) as total_discounts
  FROM "Order" o
  WHERE o.status NOT IN ('cancelled', 'unpaid')
    ${dateFilter}
    ${claimedByFilter}
  GROUP BY period_start
  ORDER BY period_start ASC
  `;

    const salesByPeriodParams = [...params, ...params];


    const mainStats = db.prepare(mainStatsQuery).get(...params);
    const historicTotals = claimedById
      ? db.prepare(historicTotalsQuery).get(claimedById)
      : db.prepare(historicTotalsQuery).get();
    const hourlyDistribution = db.prepare(hourlyQuery).all(...params);
    const topItems = db.prepare(topItemsQuery).all(...params);
    const salesByPeriod = db
      .prepare(salesAggregationQuery)
      .all(...salesByPeriodParams);

    let aggregationType = "daily";
    if (salesByPeriod.length > 0) {
      const firstDate = new Date(salesByPeriod[0].period_start);
      const secondDate = salesByPeriod[1]
        ? new Date(salesByPeriod[1].period_start)
        : null;

      if (secondDate) {
        const diffDays = (secondDate - firstDate) / (1000 * 60 * 60 * 24);
        if (diffDays >= 365) aggregationType = "yearly";
        else if (diffDays >= 28) aggregationType = "monthly";
        else if (diffDays >= 7) aggregationType = "weekly";
      }
    }

    return {
      activeOrders: mainStats.activeOrders || 0,
      cancelledOrders: mainStats.cancelledOrders || 0,
      completedOrders: mainStats.completedOrders || 0,
      totalSales: mainStats.totalSales || 0,
      totalTips: mainStats.totalTips || 0,
      totalDiscounts: mainStats.totalDiscounts || 0,
      orderCount: mainStats.orderCount || 0,
      historicTotals,
      averageOrderValue:
        Math.round((mainStats.averageOrderValue || 0) * 100) / 100,
      conversionRate: mainStats.orderCount
        ? parseFloat(
            ((mainStats.completedOrders / mainStats.orderCount) * 100).toFixed(
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
      salesByPeriod: {
        type: aggregationType,
        data: salesByPeriod.map((period) => ({
          periodStart: period.period_start,
          orderCount: period.order_count,
          totalSales: period.total_sales || 0,
          totalTips: period.total_tips || 0,
          totalDiscounts: period.total_discounts || 0,
        })),
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
            SET customer = ?, subtotal = ?, discountTotal = ?, total = ?, tip = ?, paymentMethod = ?, cancelledById = ?, cancelledAt = ?, cancelReason = ?, status = ?, claimedById = ?, billedById = ?, billedAt = ?, createdAt = ?, updatedAt = ?, ready = ?
            WHERE id = ?`
    );
    const result = stmt.run(
      this.customer,
      this.subtotal,
      this.discountTotal,
      this.total,
      this.tip,
      this.paymentMethod,
      this.cancelledById,
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
