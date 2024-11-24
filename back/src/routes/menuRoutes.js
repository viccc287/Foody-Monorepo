import { Router } from "express";
import MenuItem from "../entities/StockEntities/MenuItem";
import Ingredient from "../entities/StockEntities/Ingredient";
import StockItem from "../entities/StockEntities/StockItem";

const router = Router();

/**
 * ===================== Routes for MenuItem =====================
 */

// Get all menu items
router.get("/menu-items", (req, res) => {
    try {
        const menuItems = MenuItem.getAll();
        res.json(menuItems);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch menu items. " + error.message });
    }
});

// Get a specific menu item by ID
router.get("/menu-items/:id", (req, res) => {
    try {
        const { id } = req.params;
        const menuItem = MenuItem.getById(Number(id));
        if (menuItem) {
            res.json(menuItem);
        } else {
            res.status(404).json({ error: "MenuItem not found." });
        }
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch menu item. " + error.message });
    }
});

// Get a specific menu item by ID with its ingredients/stock info
router.get("/menu-items/:id/ingredients", (req, res) => {
    try {
        const { id } = req.params;
        const menuItem = MenuItem.getById(Number(id));

        if (menuItem) {
            const ingredients = Ingredient.getByMenuItemId(menuItem.id);
            const ingredientsWithStockInfo = ingredients.map((ingredient) => {
                const stockItem = StockItem.getById(ingredient.inventoryProductId);
                return {
                    ...ingredient,
                    stockItem,
                };
            });

            res.json({
                ...menuItem,
                ingredients: ingredientsWithStockInfo,
            });

        } else {
            res.status(404).json({ error: "MenuItem not found." });
        }
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch menu item. " + error.message });
    }
});

// Create a new menu item
router.post("/menu-items", (req, res) => {
    try {
        const menuItem = new MenuItem(req.body);
        const id = menuItem.save();
        res.status(201).json({ id });
    } catch (error) {
        res.status(500).json({ error: "Failed to create menu item. " + error.message });
    }
});

// Update an existing menu item
router.put("/menu-items/:id", (req, res) => {
    try {
        const { id } = req.params;
        const menuItem = MenuItem.getById(Number(id));

        if (menuItem) {
            Object.assign(menuItem, req.body);
            menuItem.save();
            res.json({ message: "MenuItem updated successfully." });
        } else {
            res.status(404).json({ error: "MenuItem not found." });
        }
    } catch (error) {
        res.status(500).json({ error: "Failed to update menu item. " + error.message });
    }
});

// Delete a menu item
router.delete("/menu-items/:id", (req, res) => {
    try {
        const { id } = req.params;
        const menuItem = MenuItem.getById(Number(id));
        if (menuItem) {
            menuItem.delete();
            res.json({ message: "MenuItem deleted successfully." });
        } else {
            res.status(404).json({ error: "MenuItem not found." });
        }
    } catch (error) {
        res.status(500).json({ error: "Failed to delete menu item. " + error.message });
    }
});

/**
 * =============== Routes for Ingredients ===============
 */

// Get all ingredients ! This has no useful purpose, but it's here for demonstration purposes
router.get("/ingredients", (req, res) => {
    try {
        const ingredients = Ingredient.getAll();
        res.json(ingredients);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch ingredients. " + error.message });
    }
});

// Get ingredients by menu item ID
router.get("/ingredients/menu-item/:menuItemId", (req, res) => {
    try {
        const { menuItemId } = req.params;
        const ingredients = Ingredient.getByMenuItemId(Number(menuItemId));
        res.json(ingredients);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch ingredients. " + error.message });
    }
});

// Add a new ingredient
router.post("/ingredients", (req, res) => {
    try {
        const ingredient = new Ingredient(req.body);

        const menuItem = MenuItem.getById(ingredient.menuItemId);
        if (!menuItem) {
            return res.status(404).json({ error: "MenuItem not found." });
        }

        const inventoryProduct = StockItem.getById(ingredient.inventoryProductId);
        if (!inventoryProduct) {
            return res.status(404).json({ error: "Inventory product not found." });
        }

        const id = ingredient.save();
        res.status(201).json({ id });
    } catch (error) {
        res.status(500).json({ error: "Failed to create ingredient. " + error.message });
    }
});

// Update an ingredient
router.put("/ingredients/:id", (req, res) => {
    try {
        const { id } = req.params;
        const ingredient = Ingredient.getById(Number(id));
        if (ingredient) {
            Object.assign(ingredient, req.body);
            ingredient.save();
            res.json({ message: "Ingredient updated successfully." });
        } else {
            res.status(404).json({ error: "Ingredient not found." });
        }
    } catch (error) {
        res.status(500).json({ error: "Failed to update ingredient. " + error.message });
    }
});

// Delete an ingredient
router.delete("/ingredients/:id", (req, res) => {
    try {
        const { id } = req.params;
        const ingredient = Ingredient.getById(Number(id));
        if (ingredient) {
            ingredient.delete();
            res.json({ message: "Ingredient deleted successfully." });
        } else {
            res.status(404).json({ error: "Ingredient not found." });
        }
    } catch (error) {
        res.status(500).json({ error: "Failed to delete ingredient. " + error.message });
    }
});

/**
 * ==================== Routes for StockItem ====================
 */

// Get all stock items
router.get("/stock-items", (req, res) => {
    try {
        const stockItems = StockItem.getAll();
        res.json(stockItems);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch stock items. " + error.message });
    }
});

// Get a specific stock item by ID
router.get("/stock-items/:id", (req, res) => {
    try {
        const { id } = req.params;
        const stockItem = StockItem.getById(Number(id));
        if (stockItem) {
            res.json(stockItem);
        } else {
            res.status(404).json({ error: "StockItem not found." });
        }
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch stock item. " + error.message });
    }
});

// Create a new stock item
router.post("/stock-items", (req, res) => {
    try {
        const stockItem = new StockItem(req.body);
        const id = stockItem.save();
        res.status(201).json({ id });
    } catch (error) {
        res.status(500).json({ error: "Failed to create stock item. " + error.message });
    }
});

// Update an existing stock item
router.put("/stock-items/:id", (req, res) => {
    try {
        const { id } = req.params;
        const stockItem = StockItem.getById(Number(id));
        if (stockItem) {
            Object.assign(stockItem, req.body);
            stockItem.save();
            res.json({ message: "StockItem updated successfully." });
        } else {
            res.status(404).json({ error: "StockItem not found." });
        }
    } catch (error) {
        res.status(500).json({ error: "Failed to update stock item. " + error.message });
    }
});

// Delete a stock item
router.delete("/stock-items/:id", (req, res) => {
    try {
        const { id } = req.params;
        const stockItem = StockItem.getById(Number(id));
        if (stockItem) {
            stockItem.delete();
            res.json({ message: "StockItem deleted successfully." });
        } else {
            res.status(404).json({ error: "StockItem not found." });
        }
    } catch (error) {
        res.status(500).json({ error: "Failed to delete stock item. " + error.message });
    }
});

export default router;