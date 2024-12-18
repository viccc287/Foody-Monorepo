import db from "../../database/connection.js";
import MenuItem from "../StockEntities/MenuItem.js";
import Promo from "../PromoEntities/Promo.js";
import Ingredient from "../StockEntities/Ingredient.js";
import StockItem from "../StockEntities/StockItem.js";
import Decimal from "decimal.js";

class OrderItem {
  static tableName = "OrderItem";

  constructor({
    id,
    menuItemId,
    orderId,
    promoId,
    quantity,
    subtotal,
    discountApplied,
    total,
    promoName,
    comments,
    quantityHistory = "[]",
    appliedPromos = "[]",
    createdAt,
    updatedAt,
    readyQuantity,
  }) {
    this.id = id || null;
    this.menuItemId = menuItemId;
    this.orderId = orderId;
    this.promoId = promoId || null;
    this.quantity = quantity;
    this.subtotal = subtotal;
    this.discountApplied = discountApplied || 0;
    this.total = total || subtotal - this.discountApplied;
    this.promoName = promoName || null;
    this.comments = comments || null;
    this.quantityHistory = JSON.parse(quantityHistory) || [];
    this.appliedPromos = JSON.parse(appliedPromos) || [];
    this.createdAt = createdAt || new Date().toISOString();
    this.updatedAt = updatedAt || new Date().toISOString();
    this.readyQuantity = readyQuantity || 0;
  }

  static getAll() {
    const stmt = db.prepare(`SELECT * FROM ${this.tableName}`);
    const rows = stmt.all();
    return rows.map((row) => new OrderItem(row));
  }

  static getById(id) {
    const stmt = db.prepare(`SELECT * FROM ${this.tableName} WHERE id = ?`);
    const row = stmt.get(id);
    return row ? new OrderItem(row) : null;
  }

  static getByOrderId(orderId) {
    const stmt = db.prepare(
      `SELECT * FROM ${this.tableName} WHERE orderId = ?`
    );
    const rows = stmt.all(orderId);
    return rows.map((row) => new OrderItem(row));
  }

  async addQuantity(additionalQuantity, timestamp = new Date().toISOString()) {
    // Add to history

    if (this.quantity + additionalQuantity >= 0) {
      this.quantityHistory.push({
        quantity: additionalQuantity,
        timestamp,
      });
    }

    // Update total quantity

    this.quantity += additionalQuantity;

    if (this.quantity < 0) this.quantity = 0;

    // Recalculate base subtotal
    const menuItem = await MenuItem.getById(this.menuItemId);
    this.subtotal = menuItem.price * this.quantity;

    // Get active promos
    const promos = await Promo.getActiveByMenuItemId(this.menuItemId);
    

    // Calculate new promotions
    this.calculatePromotions(timestamp, promos);

    // Update totals
    this.updateTotals();

    return this.save();
  }

  calculatePromotions(currentTimestamp, activePromos) {
    // Sort quantity history by timestamp
    const sortedHistory = [...this.quantityHistory].sort(
      (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
    );

    // Process each promo
    activePromos.forEach((promo) => {
      let eligibleQuantity = 0;

      // Calculate eligible quantity based on timestamps
      sortedHistory.forEach((entry) => {
        entry.promoActive = false;
        if (promo.isValidAtTimestamp(entry.timestamp)) {
  /*         entry.promoActive = true;
          entry.promoId = promo.id;
          entry.promoName = promo.name; */
          eligibleQuantity += entry.quantity;
          eligibleQuantity < 0 ? 0 : eligibleQuantity;
        }
      });

      if (eligibleQuantity > 0) {
        const discount = promo.calculateDiscount(
          eligibleQuantity,
          eligibleQuantity * this.getBasePrice(),
          this.getBasePrice()
        );

        if (discount > 0) {
          // Record applied promo
          this.appliedPromos.push({
            promoId: promo.id,
            promoName: promo.name,
            quantity: eligibleQuantity,
            discountApplied: discount,
            timestamp: currentTimestamp,
            type: promo.type,
          });
        } else {
          // Remove promo from applied list
          this.appliedPromos = this.appliedPromos.filter(
            (appliedPromo) => appliedPromo.promoId !== promo.id
          );
        }
      }
    });
  }

  getBasePrice() {
    return MenuItem.getById(this.menuItemId).price;
  }

  updateTotals() {    
    
    
    this.discountApplied = this.appliedPromos.at(-1)?.discountApplied || 0;
    // Ensure discount doesn't exceed subtotal
    this.discountApplied = Math.min(this.discountApplied, this.subtotal);

    // Calculate final total
    this.total = this.subtotal - this.discountApplied;
  }

  checkStock(quantity) {
    const ingredients = Ingredient.getByMenuItemId(this.menuItemId);
    
    const notEnoughStockItems = [];
    const notActiveItems = [];
    const lowStockItems = [];
    
    // For negative quantities (removing items), we don't need to check stock
    if (quantity > 0) {
        // Check stock and active status only when adding items
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
            
            if (stockItem.stock - ingredient.quantityUsed * quantity < stockItem.minStock) {
                lowStockItems.push(stockItem);
            }
        }
    }
  
    
    // Update stock if there are no issues or if we're removing items
    if (notEnoughStockItems.length === 0 && notActiveItems.length === 0) {
        for (const ingredient of ingredients) {
            const stockItem = StockItem.getById(ingredient.inventoryProductId);
            const stock = new Decimal(stockItem.stock);
            const quantityUsed = new Decimal(ingredient.quantityUsed);
            const qty = new Decimal(quantity);
            
            // If quantity is negative, add to stock; if positive, subtract from stock
            stockItem.stock = stock.plus(quantityUsed.times(qty).negated()).toNumber();
            
            stockItem.save();
        }
    }
    
    return { notEnoughStockItems, notActiveItems, lowStockItems };
}


  save() {
    if (this.id) {
      return this.#updateRecord();
    } else {
      const menuItem = MenuItem.getById(this.menuItemId);
      // Calcula el subtotal si no está proporcionado
      if (!this.subtotal) {
        this.subtotal = menuItem.price * this.quantity;
      }

      /* // Recalcular el descuento si hay promociones activas
      const activePromos = Promo.getActiveByMenuItemId(this.menuItemId);
      if (activePromos.length > 0) {
        this.discountApplied = activePromos.reduce((acc, promo) => {
          return (
            acc +
            promo.calculateDiscount(
              this.quantity,
              this.subtotal,
              menuItem.price
            )
          );
        }, 0);
        this.discountApplied = Math.min(this.discountApplied, this.subtotal);
      } else {
        this.discountApplied = 0;
      }

      // Calcular el total final
      this.total = this.subtotal - this.discountApplied; */

      return this.#createRecord();
    }
  }

  #createRecord() {
    const stmt = db.prepare(
      `INSERT INTO ${OrderItem.tableName} (menuItemId, orderId, promoId, quantity, subtotal, discountApplied, total, promoName, comments, quantityHistory, appliedPromos, createdAt, updatedAt, readyQuantity)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    );
    const result = stmt.run(
      this.menuItemId,
      this.orderId,
      this.promoId,
      this.quantity,
      this.subtotal,
      this.discountApplied,
      this.total,
      this.promoName,
      this.comments,
      JSON.stringify(this.quantityHistory),
      JSON.stringify(this.appliedPromos),
      this.createdAt,
      this.updatedAt,
      this.readyQuantity
    );
    this.id = result.lastInsertRowid;
    return this.id;
  }

  #updateRecord() {
    const stmt = db.prepare(
      `UPDATE ${OrderItem.tableName}
            SET menuItemId = ?, orderId = ?, promoId = ?, quantity = ?, subtotal = ?, discountApplied = ?, total = ?, promoName = ?, comments = ?, quantityHistory = ?, appliedPromos = ?, createdAt = ?, updatedAt = ?, readyQuantity = ?
            WHERE id = ?`
    );
    const result = stmt.run(
      this.menuItemId,
      this.orderId,
      this.promoId,
      this.quantity,
      this.subtotal,
      this.discountApplied,
      this.total,
      this.promoName,
      this.comments,
      JSON.stringify(this.quantityHistory),
      JSON.stringify(this.appliedPromos),
      this.createdAt,
      this.updatedAt,
      this.readyQuantity,
      this.id
    );
    return result.changes > 0;
  }

  delete() {
    if (!this.id) throw new Error("Cannot delete an unsaved OrderItem.");
    const stmt = db.prepare(`DELETE FROM ${OrderItem.tableName} WHERE id = ?`);
    const result = stmt.run(this.id);
    return result.changes > 0;
  }
}

export default OrderItem;
