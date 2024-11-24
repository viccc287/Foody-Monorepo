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
        res.status(500).json({ error: "Failed to fetch orders." });
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
        res.status(500).json({ error: "Failed to fetch order." });
    }
});

// Create a new order
router.post("/", (req, res) => {
    try {
        const order = new Order(req.body);
        const id = order.save();
        res.status(201).json({ id });
    } catch (error) {
        res.status(500).json({ error: "Failed to create order. " + error});
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
        res.status(500).json({ error: "Failed to update order." });
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
        res.status(500).json({ error: "Failed to delete order." });
    }
});


/**
 * ================= Routes for OrderItems ================= 
 */

// Get all order items just for testing purposesz
router.get("/order-items", (req, res) => {
    try {
        const orderItems = OrderItem.getAll();
        res.json(orderItems);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch order items." });
    }
});

// Get all items for a specific order
router.get("/order-items/order/:orderId", (req, res) => {
    try {
        const { orderId } = req.params;
        const orderItems = OrderItem.getByOrderId(Number(orderId));
        res.json(orderItems);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch order items for the order." });
    }
});

// Create a new order item. This one is a bit different because we need to pass the order ID in the body
router.post("/order-items", (req, res) => {
    try {
        const orderItem = new OrderItem(req.body);
        const id = orderItem.save();
        res.status(201).json({ id });
    } catch (error) {
        res.status(500).json({ error: "Failed to create order item." });
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
        res.status(500).json({ error: "Failed to update order item." });
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
        res.status(500).json({ error: "Failed to delete order item." });
    }
});


export default router;
