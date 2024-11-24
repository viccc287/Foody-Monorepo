import { Router } from "express";
import Order from "../entities/OrderEntities/Order";
import OrderItem from "../entities/OrderEntities/OrderItem";

const router = Router();

/**
 * =================  Routes for Orders  =================  
 */

// Get all orders
router.get("/", (req, res) => {
    try {
        const orders = Order.getAll();
        res.json(orders);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch orders. " + error.message });
    }
});

// Get a specific order by ID
router.get("/:id", (req, res) => {
    try {
        const { id } = req.params;
        const order = Order.getById(Number(id));
        if (order) {
            res.json(order);
        } else {
            res.status(404).json({ error: "Order not found." });
        }
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch order. " + error.message });
    }
});

// Create a new order
router.post("/", (req, res) => {
    try {
        const order = new Order(req.body);
        const id = order.save();
        res.status(201).json({ id });
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
            order.save();
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
            res.json({ message: "Order deleted successfully." });
        } else {
            res.status(404).json({ error: "Order not found." });
        }
    } catch (error) {
        res.status(500).json({ error: "Failed to delete order. " + error.message });
    }
});

/**
 * ================= Routes for OrderItems ================= 
 */

// Get all order items just for testing purposes
router.get("/order-items", (req, res) => {
    try {
        const orderItems = OrderItem.getAll();
        res.json(orderItems);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch order items. " + error.message });
    }
});

// Get all items for a specific order
router.get("/order-items/order/:orderId", (req, res) => {
    try {
        const { orderId } = req.params;
        const orderItems = OrderItem.getByOrderId(Number(orderId));
        res.json(orderItems);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch order items for the order. " + error.message });
    }
});

// Create a new order item. This one is a bit different because we need to pass the order ID in the body
router.post("/order-items", (req, res) => {
    try {
        const orderItem = new OrderItem(req.body);
        const id = orderItem.save();
        res.status(201).json({ id });
    } catch (error) {
        res.status(500).json({ error: "Failed to create order item. " + error.message });
    }
});

// Update an order item
router.put("/order-items/:id", (req, res) => {
    try {
        const { id } = req.params;
        const orderItem = OrderItem.getById(Number(id));
        if (orderItem) {
            Object.assign(orderItem, req.body);
            orderItem.save();
            res.json({ message: "OrderItem updated successfully." });
        } else {
            res.status(404).json({ error: "OrderItem not found." });
        }
    } catch (error) {
        res.status(500).json({ error: "Failed to update order item. " + error.message });
    }
});

// Delete an order item
router.delete("/order-items/:id", (req, res) => {
    try {
        const { id } = req.params;
        const orderItem = OrderItem.getById(Number(id));
        if (orderItem) {
            orderItem.delete();
            res.json({ message: "OrderItem deleted successfully." });
        } else {
            res.status(404).json({ error: "OrderItem not found." });
        }
    } catch (error) {
        res.status(500).json({ error: "Failed to delete order item. " + error.message });
    }
});

export default router;