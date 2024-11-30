import { Router } from "express";
import OrderItem from "../entities/OrderEntities/OrderItem.js";
import Promo from "../entities/PromoEntities/Promo.js";
import MenuItem from "../entities/StockEntities/MenuItem.js";
import Order from "../entities/OrderEntities/Order.js";
import Ingredient from "../entities/StockEntities/Ingredient.js";
import StockItem from "../entities/StockEntities/StockItem.js";
import Decimal from "decimal.js";

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
      quantity: 0,
      subtotal: 0,
      comments,
      quantityHistory: "[]",
      appliedPromos: "[]",
    });

    const ingredients = Ingredient.getByMenuItemId(orderItem.menuItemId);

    const notEnoughStock = [];
    const notActiveItems = [];

    for (const ingredient of ingredients) {
      const stockItem = StockItem.getById(ingredient.inventoryProductId);

      if (!stockItem.isActive) {
        notActiveItems.push(stockItem);
        continue;
      }

      if (stockItem.stock - ingredient.quantityUsed * quantity < 0) {
        notEnoughStock.push({
          ...stockItem,
          required: ingredient.quantityUsed * quantity,
        });
        continue;
      }

      if (notEnoughStock.length === 0 && notActiveItems.length === 0) {
        const stock = new Decimal(stockItem.stock);
        const quantityUsed = new Decimal(ingredient.quantityUsed);
        const qty = new Decimal(quantity);
        stockItem.stock = stock.minus(quantityUsed.times(qty)).toNumber();

        stockItem.save();
      }
    }

    if (notActiveItems.length > 0) {
      return res.status(400).json({
        error: "Hay insumos que no están activos",
        notActiveItems,
      });
    }

    if (notEnoughStock.length > 0) {
      return res.status(400).json({
        error: "No hay suficientes insumos para agregar esto",
        notEnoughStock,
      });
    }

    await orderItem.save();
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
      return res
        .status(400)
        .json({ error: "No se puede reducir más la cantidad de el item" });
    }
    const ingredients = Ingredient.getByMenuItemId(orderItem.menuItemId);

    const notEnoughStockItems = [];
    const notActiveItems = [];

    for (const ingredient of ingredients) {
      const stockItem = StockItem.getById(ingredient.inventoryProductId);

      if (!stockItem.isActive) {
        notActiveItems.push(stockItem);
        continue;
      }

      if (stockItem.stock - ingredient.quantityUsed * quantity < 0) {
        notEnoughStockItems.push({
          ...stockItem,
          required: ingredient.quantityUsed * quantity,
        });
        continue;
      }
      if (notEnoughStockItems.length === 0 && notActiveItems.length === 0) {
        const stock = new Decimal(stockItem.stock);
        const quantityUsed = new Decimal(ingredient.quantityUsed);
        const qty = new Decimal(quantity);
        stockItem.stock = stock.minus(quantityUsed.times(qty)).toNumber();

        stockItem.save();
      }
    }

    if (notActiveItems.length > 0) {
      return res.status(400).json({
        error: "Hay insumos que no están activos",
        notActiveItems,
      });
    }

    if (notEnoughStockItems.length > 0) {
      return res.status(400).json({
        error: "No hay suficientes insumos para agregar esto",
        notEnoughStockItems,
      });
    }

    if (comments) orderItem.comments = comments;
    await orderItem.save();
    await orderItem.addQuantity(quantity, timestamp);

    const order = Order.getById(orderItem.orderId);
    const enhancedOrder = order.getEnhancedOrder();

    res.json({ orderItem, order: enhancedOrder });
  } catch (error) {
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

    for (const ingredient of ingredients) {
      const stockItem = StockItem.getById(ingredient.inventoryProductId);
      const stock = new Decimal(stockItem.stock);
      const quantityUsed = new Decimal(ingredient.quantityUsed);
      const orderItemQuantity = new Decimal(orderItem.quantity);
      stockItem.stock = stock
        .plus(quantityUsed.times(orderItemQuantity))
        .toNumber();
      stockItem.save();
    }
    await orderItem.delete();

    const enhancedOrder = order.getEnhancedOrder();

    res.json(enhancedOrder);
  } catch (error) {
    console.error("Error deleting OrderItem:", error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
