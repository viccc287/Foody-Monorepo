import { Router } from "express";
import OrderItem from "../entities/OrderEntities/OrderItem";
import Promo from "../entities/PromoEntities/Promo";
import MenuItem from "../entities/StockEntities/MenuItem";

const router = Router();

router.get("/", (req, res) => {
  try {
    const orderItems = OrderItem.getAll();
    res.json(orderItems);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to fetch order items. " + error.message });
  }
});

router.post("/", async (req, res) => {
    try {
      const { menuItemId, orderId, quantity, comments } = req.body;
      const timestamp = new Date().toISOString();
  
      // Validate menuItem exists
      const menuItem = MenuItem.getById(menuItemId);
      if (!menuItem) {
        return res.status(400).json({ error: "El MenuItem proporcionado no existe." });
      }
  
      // Create new OrderItem with initial history
      const orderItem = new OrderItem({
        menuItemId,
        orderId,
        quantity: 0, // Start at 0 since we'll add quantity next
        subtotal: 0,
        comments,
        quantityHistory: '[]',
        appliedPromos: '[]'
      });
  
      // Save initial record
      await orderItem.save();
  
      // Add initial quantity which will handle promo calculations
      await orderItem.addQuantity(quantity, timestamp);
  
      // Return complete orderItem with calculated values
      res.status(201).json(orderItem);
  
    } catch (error) {
      console.error("Error creating OrderItem:", error);
      res.status(500).json({ error: error.message });
    }
  });

router.put('/:id/quantity', async (req, res) => {
    const { id } = req.params;
    const { quantity, timestamp } = req.body;

    try {
        const orderItem = await OrderItem.getById(id);
        if (!orderItem) {
            return res.status(404).json({ error: 'OrderItem not found' });
        }

        await orderItem.addQuantity(quantity, timestamp);
        
        res.json(orderItem);
    } catch (error) {
        console.log(error);
        
        res.status(500).json({ error: error.message });
    }
});

router.get("/order/:orderId", (req, res) => {
  try {
    const { orderId } = req.params;
    const orderItems = OrderItem.getByOrderId(orderId);

    if (!orderItems || orderItems.length === 0) {
      res.status(404).json({
        error: "No se encontraron OrderItems para el OrderId proporcionado.",
      });
      return;
    }

    res.json(orderItems);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Error al obtener los OrderItems. " + error.message });
  }
});

export default router;
