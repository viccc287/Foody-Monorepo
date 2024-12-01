import { Router } from "express";
import Order from "../entities/OrderEntities/Order.js";
import OrderItem from "../entities/OrderEntities/OrderItem.js";
import Ingredient from "../entities/StockEntities/Ingredient.js";
import StockItem from "../entities/StockEntities/StockItem.js";

const router = Router();

/**
 * =================  Routes for Orders  =================
 */

// Get all orders
// Get orders with optional pagination
router.get("/", (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || -1;
    const offset = (page - 1) * (limit === -1 ? 0 : limit);

    let startDate = req.query.startDate ? new Date(req.query.startDate) : null;
    let endDate = req.query.endDate ? new Date(req.query.endDate) : null;

    // Validate dates
    if (
      (startDate && isNaN(startDate.getTime())) ||
      (endDate && isNaN(endDate.getTime()))
    ) {
      return res.status(400).json({ error: "Invalid date format" });
    }

    // Convert to ISO string for SQL
    startDate = startDate?.toISOString();
    endDate = endDate?.toISOString();

    const { orders, total } = Order.getAllPaginated(
      offset,
      limit,
      startDate,
      endDate
    );

    const enhancedOrders = orders.map((order) => order.getEnhancedOrder());

    const response = {
      orders: enhancedOrders,
      total,
    };

    if (limit !== -1) {
      response.pagination = {
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    }

    res.json(response);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch orders. " + error.message });
  }
});

router.get("/dashboard-stats", (req, res) => {
  try {
    let startDate = req.query.startDate ? new Date(req.query.startDate) : null;
    let endDate = req.query.endDate ? new Date(req.query.endDate) : null;

    // Validate dates
    if (
      (startDate && isNaN(startDate.getTime())) ||
      (endDate && isNaN(endDate.getTime()))
    ) {
      return res.status(400).json({ error: "Invalid date format" });
    }

    // Convert to ISO string for SQL
    startDate = startDate?.toISOString();
    endDate = endDate?.toISOString();

    const stats = Order.getDashboardStats(startDate, endDate);
    res.json(stats);
  } catch (error) {
    
    res
      .status(500)
      .json({ error: "Failed to fetch dashboard stats. " + error.message });
  }
});

router.get("/total-sales", (req, res) => {
  try {
    let startDate = req.query.startDate ? new Date(req.query.startDate) : null;
    let endDate = req.query.endDate ? new Date(req.query.endDate) : null;

    // Validate dates
    if (
      (startDate && isNaN(startDate.getTime())) ||
      (endDate && isNaN(endDate.getTime()))
    ) {
      return res.status(400).json({ error: "Invalid date format" });
    }

    // Convert to ISO string for SQL
    startDate = startDate?.toISOString();
    endDate = endDate?.toISOString();

    const totals = Order.getTotalSales(startDate, endDate);
    res.json(totals);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to fetch total sales. " + error.message });
  }
});

router.get("/active", (req, res) => {
  try {
    const orders = Order.getByStatus("active");

    const enhancedOrders = orders.map((order) => order.getEnhancedOrder());

    res.json({ orders: enhancedOrders });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch orders. " + error.message });
  }
});

router.get("/active-orders-by-agent/:agentId", (req, res) => {
  try {
    const { agentId } = req.params;
    const orders = Order.getActiveByClaimedId(agentId);

    // Enhance each order with items and calculations
    const enhancedOrders = orders.map((order) => order.getEnhancedOrder());

    res.json({ orders: enhancedOrders });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch orders. " + error.message });
  }
});

// Get a specific order by ID
router.get("/:id", (req, res) => {
  const orderId = req.params.id;
  const order = Order.getById(orderId);

  if (!order) {
    return res.status(404).json({ message: "Order not found" });
  }

  const orderItems = OrderItem.getByOrderId(orderId);
  let subtotal = 0;
  let discountTotal = 0;

  orderItems.forEach((item) => {
    subtotal += item.subtotal;
    discountTotal += item.discountApplied;
  });

  const total = subtotal - discountTotal < 0 ? 0 : subtotal - discountTotal;

  order.subtotal = subtotal;
  order.discountTotal = discountTotal;
  order.total = total;

  res.json({
    ...order,
    orderItems,
  });
});

// Create a new order
router.post("/", (req, res) => {
  try {
    const order = new Order(req.body);
    order.createdAt = new Date().toISOString();
    order.updatedAt = new Date().toISOString();
    order.save();
    const enhancedOrder = order.getEnhancedOrder();
    req.io.emit("orderChanged", { action: "created", order: enhancedOrder });

    res.status(201).json(enhancedOrder);
  } catch (error) {
    res.status(500).json({ error: "Failed to create order. " + error.message });
  }
});

// Update an existing order
router.put("/:id", (req, res) => {
  try {
    const { id } = req.params;
    const order = Order.getById(Number(id));
    if (order) {
      Object.assign(order, req.body);
      order.updatedAt = new Date().toISOString();
      order.save();
      const enhancedOrder = order.getEnhancedOrder();
      req.io.emit("orderChanged", { action: "updated", order: enhancedOrder });

      res.json({ message: "Order updated successfully." });
    } else {
      res.status(404).json({ error: "Order not found." });
    }
  } catch (error) {
    res.status(500).json({ error: "Failed to update order. " + error.message });
  }
});

// Delete an order
router.delete("/:id", (req, res) => {
  try {
    const { id } = req.params;
    const order = Order.getById(Number(id));
    if (order) {
      order.delete();
      req.io.emit("orderChanged", { action: "deleted", orderId: id });
      res.json({ message: "Order deleted successfully." });
    } else {
      res.status(404).json({ error: "Order not found." });
    }
  } catch (error) {
    res.status(500).json({ error: "Failed to delete order. " + error.message });
  }
});

router.get("/:orderId/order-items", (req, res) => {
  try {
    const { orderId } = req.params;
    const orderItems = OrderItem.getByOrderId(Number(orderId));
    res.json(orderItems);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to fetch order items. " + error.message });
  }
});

router.put("/:id/charge", async (req, res) => {
  try {
    const { id } = req.params;
    const {  paymentMethod, billedById } = req.body;

    const order = Order.getById(Number(id));
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Update order status
    order.paymentMethod = paymentMethod;
    order.status = "paid";
    order.billedById = billedById;
    order.billedAt = new Date().toISOString();

    order.updateTotals();
    order.save();

    const enhancedOrder = order.getEnhancedOrder();

    req.io.emit("orderChanged", { action: "updated", order: enhancedOrder });

    res.json({ message: "Order charged successfully." });
  } catch (error) {
    res.status(500).json({ error: "Failed to charge order. " + error.message });
  }
});

// Ruta para cancelar la orden
router.put("/:id/cancel", async (req, res) => {
  try {
    const { id } = req.params;
    const { cancelReason } = req.body;

    const order = Order.getById(Number(id));
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    order.status = "cancelled";
    order.cancelledAt = new Date().toISOString();
    order.cancelReason = cancelReason;

    order.save();

    const orderItems = OrderItem.getByOrderId(Number(id));
    orderItems.forEach((item) => {
      const ingredients = Ingredient.getByMenuItemId(item.menuItemId);

      for (const ingredient of ingredients) {
        const stockItem = StockItem.getById(ingredient.inventoryProductId);
        stockItem.stock += ingredient.quantityUsed * item.quantity;
        stockItem.save();
      }

      item.delete();
    });

    const enhancedOrder = order.getEnhancedOrder();

    req.io.emit("orderChanged", { action: "updated", order: enhancedOrder });

    res.status(200).json({ message: "Order cancelled successfully", order });
  } catch (error) {
    console.log(error);

    res.status(500).json({ message: "Server error", error });
  }
});

router.put("/:id/unpay", async (req, res) => {
  try {
    const { id } = req.params;

    const order = Order.getById(Number(id));
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    order.status = "unpaid";
    order.billedById = null;
    order.billedAt = null;
    order.save();

    const enhancedOrder = order.getEnhancedOrder();

    req.io.emit("orderChanged", { action: "updated", order: enhancedOrder });

    res.json({ message: "Order status updated successfully." });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to update order status. " + error.message });
  }
});

// Add tip to order
router.patch("/:id/tip", (req, res) => {
  try {
    const { id } = req.params;
    const { tip } = req.body;

    // Validate tip is provided
    if (tip === undefined) {
      return res.status(400).json({ error: "Tip amount is required" });
    }

    const order = Order.getById(Number(id));
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Update only the tip
    order.tip += tip;
    order.save();

    const enhancedOrder = order.getEnhancedOrder();
    
    req.io.emit("orderChanged", { action: "updated", order: enhancedOrder });

    res.json({
      message: "Tip added successfully",
      order: enhancedOrder,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to add tip. " + error.message });
  }
});
export default router;
