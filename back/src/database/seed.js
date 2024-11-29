import db from "./connection.js";

const seed = () => {

  const isTableEmpty = (tableName) => {
    const stmt = db.prepare(`SELECT COUNT(*) as count FROM ${tableName}`);
    const result = stmt.get();
    return result.count === 0;
  };

/*   // Seed para Category
  if (isTableEmpty("Category")) {
    console.log("Seed data: Adding initial categories...");
    const categories = [
      {
        id: 1,
        name: "Entradas",
        description: "Categoría para entradas del menú",
        type: "menu",
      },
      {
        id: 2,
        name: "Bebidas",
        description: "Categoría para bebidas del menú",
        type: "menu",
      },
      {
        id: 3,
        name: "Ingredientes",
        description: "Categoría para ingredientes de cocina",
        type: "stock",
      },
      {
        id: 4,
        name: "Limpieza",
        description: "Categoría para productos de limpieza",
        type: "stock",
      },
      {
        id: -1,
        name: "Sin clasificar",
        description: "Categoría para productos sin clasificar",
        type: "stock",
      },
      {
        id: -2,
        name: "Sin clasificar",
        description: "Categoría para productos sin clasificar",
        type: "menu",
      },
    ];

    const insertCategoryStmt = db.prepare(`
      INSERT INTO Category (id, name, description, type) VALUES (?, ?, ?, ?)
    `);

    categories.forEach((category) => {
      insertCategoryStmt.run(
        category.id,
        category.name,
        category.description,
        category.type
      );
    });

    console.log("Categories seeded.");
  }

  // Seed para Supplier
  if (isTableEmpty("Supplier")) {
    console.log("Seed data: Adding initial suppliers...");
    const suppliers = [
      {
        name: "Distribuidora Alimentos",
        phone: "555-123-4567",
        email: "ventas@alimentos.com",
        address: "Calle 1, Ciudad A",
      },
      {
        name: "Bebidas Premium",
        phone: "555-987-6543",
        email: "contacto@bebidas.com",
        address: "Avenida B, Ciudad B",
      },
      {
        name: "Productos Limpieza",
        phone: "555-654-3210",
        email: "soporte@limpieza.com",
        address: "Calle C, Ciudad C",
      },
    ];

    const insertSupplierStmt = db.prepare(`
      INSERT INTO Supplier (name, phone, email, address) VALUES (?, ?, ?, ?)
    `);

    suppliers.forEach((supplier) => {
      insertSupplierStmt.run(
        supplier.name,
        supplier.phone,
        supplier.email,
        supplier.address
      );
    });

    console.log("Suppliers seeded.");
  }

  // Seed para StockItem
  if (isTableEmpty("StockItem")) {
    console.log("Seed data: Adding initial stock items...");
    const stockItems = [
      {
        name: "Harina",
        stock: 50,
        unit: "kg",
        isActive: true,
        categoryId: 3,
        supplierId: 1,
        cost: 12.5,
      },
      {
        name: "Azúcar",
        stock: 30,
        unit: "kg",
        isActive: true,
        categoryId: 3,
        supplierId: 1,
        cost: 10.0,
      },
      {
        name: "Leche",
        stock: 100,
        unit: "litros",
        isActive: true,
        categoryId: 3,
        supplierId: 1,
        cost: 1.2,
      },
      {
        name: "Refrescos",
        stock: 200,
        unit: "botellas",
        isActive: true,
        categoryId: 2,
        supplierId: 2,
        cost: 0.8,
      },
      {
        name: "Detergente",
        stock: 20,
        unit: "litros",
        isActive: true,
        categoryId: 4,
        supplierId: 3,
        cost: 15.0,
      },
    ];

    const insertStockItemStmt = db.prepare(`
      INSERT INTO StockItem (name, stock, unit, isActive, categoryId, supplierId, cost)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    stockItems.forEach((item) => {
      insertStockItemStmt.run(
        item.name,
        item.stock,
        item.unit,
        item.isActive ? 1 : 0,
        item.categoryId,
        item.supplierId,
        item.cost
      );
    });

    console.log("Stock items seeded.");
  } */

  // Seed para Agent
  if (isTableEmpty("Agent")) {
    console.log("Seed data: Adding initial agent...");
    const agents = [
      {
        name: "Admin",
        lastName: "Admin",
        image: "",
        address: "",
        phone: "1234567890",
        rfc: "CHH123456789",
        email: "admin@admin.com",
        pin: "1234",
        role: "manager",
        isActive: true,
      },
    ];

    const insertAgentStmt = db.prepare(`
      INSERT INTO Agent (name, lastName, image, address, phone, rfc, email, pin, role, isActive)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    agents.forEach((agent) => {
      insertAgentStmt.run(
        agent.name,
        agent.lastName,
        agent.image,
        agent.address,
        agent.phone,
        agent.rfc,
        agent.email,
        agent.pin,
        agent.role,
        agent.isActive ? 1 : 0
      );
    });

    console.log("Admin seeded.");
  }

  console.log("Seed completed!");
};

export default seed;
