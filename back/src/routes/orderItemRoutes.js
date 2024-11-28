import { Router } from "express";
import OrderItem from "../entities/OrderEntities/OrderItem";
import Promo from "../entities/PromoEntities/Promo";
import MenuItem from "../entities/StockEntities/MenuItem";
import Order from "../entities/OrderEntities/Order";
import Ingredient from "../entities/StockEntities/Ingredient";
import StockItem from "../entities/StockEntities/StockItem";

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
      return res
        .status(400)
        .json({ error: "El MenuItem proporcionado no existe." });
    }

    // Create new OrderItem with initial history
    const orderItem = new OrderItem({
      menuItemId,
      orderId,
      quantity: 0, // Start at 0 since we'll add quantity next
      subtotal: 0,
      comments,
      quantityHistory: "[]",
      appliedPromos: "[]",
    });

    // Save initial record
    await orderItem.save();

    // Add initial quantity which will handle promo calculations
    await orderItem.addQuantity(quantity, timestamp);

    const order = Order.getById(orderId);
    const enhancedOrder = order.getEnhancedOrder();

    // Return complete orderItem with calculated values
    res.status(201).json({ orderItem, order: enhancedOrder });
  } catch (error) {
    console.error("Error creating OrderItem:", error);
    res.status(500).json({ error: error.message });
  }
});

router.put("/:id/quantity", async (req, res) => {
  const { id } = req.params;
  const { quantity, timestamp, comments } = req.body;

  try {
    const orderItem = await OrderItem.getById(id);
    if (!orderItem) {
      return res.status(404).json({ error: "OrderItem not found" });
    }    

    if (orderItem.quantity + quantity < 0) {
      return res.status(400).json({ error: "No se puede reducir más la cantidad de el item" });
    }
    const ingredients = Ingredient.getByMenuItemId(orderItem.menuItemId);

    const notEnoughStock = [];

    for (const ingredient of ingredients) {
      const stockItem = StockItem.getById(ingredient.inventoryProductId);
      console.log('stock de stockItem antes: ', stockItem.name, stockItem.stock);
      
      if (stockItem.stock - ingredient.quantityUsed * quantity < 0) {
        notEnoughStock.push({...stockItem, required: ingredient.quantityUsed * quantity});
        continue;
      }
      stockItem.stock -= ingredient.quantityUsed * quantity;
      console.log('stock de stockItem despues: ', stockItem.name, stockItem.stock);

      stockItem.save();
    }

    if (notEnoughStock.length > 0) {
      return res.status(400).json({ error: "No hay suficientes insumos para agregar esto", notEnoughStock });
    }

    if (comments) orderItem.comments = comments;
    await orderItem.save();
    await orderItem.addQuantity(quantity, timestamp);

    const order = Order.getById(orderItem.orderId);
    const enhancedOrder = order.getEnhancedOrder();

    res.json({ orderItem, order: enhancedOrder });
  } catch (error) {
    console.log(error);

    res.status(500).json({ error: error.message });
  }
});

router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const orderItem = await OrderItem.getById(id);
    if (!orderItem) {
      return res.status(404).json({ error: "OrderItem not found" });
    }
    const order = Order.getById(orderItem.orderId);

    const ingredients = Ingredient.getByMenuItemId(orderItem.menuItemId);

    console.log('quantity on order:', orderItem.quantity);
    
    for (const ingredient of ingredients) {
      const stockItem = StockItem.getById(ingredient.inventoryProductId);
      stockItem.stock += ingredient.quantityUsed * orderItem.quantity;
      stockItem.save();
    }
    await orderItem.delete();



    const enhancedOrder = order.getEnhancedOrder();
    console.log(enhancedOrder);

    res.json(enhancedOrder);
  } catch (error) {
    console.error("Error deleting OrderItem:", error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
