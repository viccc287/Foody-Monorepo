import db from "./connection.js";

const seed = () => {
  const isTableEmpty = (tableName) => {
    const stmt = db.prepare(`SELECT COUNT(*) as count FROM ${tableName}`);
    const result = stmt.get();
    return result.count === 0;
  };

  // Seed para Category
  if (isTableEmpty("Category")) {
    console.log("Seed data: Adding initial categories...");
    const categories = [
      {
        id: -1,
        name: "Sin clasificar",
        description: "Categoría para productos de inventario sin clasificar",
        type: "stock",
      },
      {
        id: -2,
        name: "Sin clasificar",
        description: "Categoría para productos de menú sin clasificar",
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
        phone: "1234567890",
        email: "ventas@alimentos.com",
        address: "Calle 1, Ciudad A",
      },
      {
        name: "Bebidas Premium",
        phone: "1234567890",
        email: "contacto@bebidas.com",
        address: "Avenida B, Ciudad B",
      },
      {
        name: "Productos Limpieza",
        phone: "1234567890",
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

  // Seed para Agent
  if (isTableEmpty("Agent")) {
    console.log("Seed data: Adding initial agent...");
    const agents = [
      {
        name: "Admin",
        lastName: "Uno",
        image: "",
        address: "",
        phone: "1234567890",
        rfc: "CHH123456789",
        email: "admin@admin.com",
        pin: "1234",
        role: "manager",
        isActive: true,
      },
      {
        name: "Mesero",
        lastName: "Uno",
        image: "",
        address: "",
        phone: "1234567890",
        rfc: "CHH123456789",
        email: "mesero@mesero.com",
        pin: "1234",
        role: "waiter",
        isActive: true,
      },
      {
        name: "Cocinero",
        lastName: "Uno",
        image: "",
        address: "",
        phone: "1234567890",
        rfc: "CHH123456789",
        email: "cocinero@cocinero.com",
        pin: "1234",
        role: "cook",
        isActive: true,
      },
      {
        name: "Cajero",
        lastName: "Uno",
        image: "",
        address: "",
        phone: "1234567890",
        rfc: "CHH123456789",
        email: "cajero@cajero.com",
        pin: "1234",
        role: "cashier",
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

  if (isTableEmpty("StockItem")) {
    console.log("Seed data: Agregando artículos de inventario iniciales...");
    const stockItems = [
      {
        name: "Tomates",
        stock: 100,
        minStock: 10,
        unit: "kg",
        isActive: true,
        categoryId: -1, // Categoría 'Sin clasificar' de inventario
        supplierId: 1, // ID de proveedor existente
        cost: 20.5,
      },
      {
        name: "Queso",
        stock: 50,
        minStock: 5,
        unit: "kg",
        isActive: true,
        categoryId: -1,
        supplierId: 2,
        cost: 50.0,
      },
      // Agrega más artículos de inventario según sea necesario
    ];

    const insertStockItemStmt = db.prepare(`
      INSERT INTO StockItem (name, stock, minStock, unit, isActive, categoryId, supplierId, cost)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stockItems.forEach((item) => {
      insertStockItemStmt.run(
        item.name,
        item.stock,
        item.minStock,
        item.unit,
        item.isActive ? 1 : 0,
        item.categoryId,
        item.supplierId,
        item.cost
      );
    });

    console.log("Artículos de inventario agregados.");
  }

  // Seed para MenuItem
  if (isTableEmpty("MenuItem")) {
    console.log("Seed data: Agregando artículos de menú iniciales...");
    const menuItems = [
      {
        name: "Pizza Margarita",
        quantity: 1,
        unit: "pieza",
        isActive: true,
        categoryId: -2, // Categoría 'Sin clasificar' de menú
        printLocations: JSON.stringify(["Cocina"]),
        variablePrice: false,
        price: 100.0,
      },
      {
        name: "Espagueti a la Boloñesa",
        quantity: 1,
        unit: "porción",
        isActive: true,
        categoryId: -2,
        printLocations: JSON.stringify(["Cocina"]),
        variablePrice: false,
        price: 120.0,
      },
      {
        name: "Hamburguesa con Papas",
        quantity: 1,
        unit: "combo",
        isActive: true,
        categoryId: -2,
        printLocations: JSON.stringify(["Cocina"]),
        variablePrice: false,
        price: 150.0,
      },
      {
        name: "Ensalada César",
        quantity: 1,
        unit: "porción",
        isActive: true,
        categoryId: -2,
        printLocations: JSON.stringify(["Cocina"]),
        variablePrice: false,
        price: 80.0,
      }
      ,
      {
        name: "Tacos al Pastor",
        quantity: 1,
        unit: "orden",
        isActive: true,
        categoryId: -2,
        printLocations: JSON.stringify(["Cocina"]),
        variablePrice: false,
        price: 90.0,
      },
      {
        name: "Sopa de Tortilla",
        quantity: 1,
        unit: "porción",
        isActive: true,
        categoryId: -2,
        printLocations: JSON.stringify(["Cocina"]),
        variablePrice: false,
        price: 70.0,
      },
      {
        name: "Chilaquiles Verdes",
        quantity: 1,
        unit: "porción",
        isActive: true,
        categoryId: -2,
        printLocations: JSON.stringify(["Cocina"]),
        variablePrice: false,
        price: 85.0,
      },
      {
        name: "Enchiladas Rojas",
        quantity: 1,
        unit: "porción",
        isActive: true,
        categoryId: -2,
        printLocations: JSON.stringify(["Cocina"]),
        variablePrice: false,
        price: 95.0,
      },
      {
        name: "Tostadas de Tinga",
        quantity: 1,
        unit: "orden",
        isActive: true,
        categoryId: -2,
        printLocations: JSON.stringify(["Cocina"]),
        variablePrice: false,
        price: 80.0,
      }

    ];

    const insertMenuItemStmt = db.prepare(`
      INSERT INTO MenuItem (name, quantity, unit, isActive, categoryId, printLocations, variablePrice, price)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    menuItems.forEach((item) => {
      insertMenuItemStmt.run(
        item.name,
        item.quantity,
        item.unit,
        item.isActive ? 1 : 0,
        item.categoryId,
        item.printLocations,
        item.variablePrice ? 1 : 0,
        item.price
      );
    });

    console.log("Artículos de menú agregados.");
  }

  // Seed para Orders y OrderItems
  if (isTableEmpty('"Order"')) {
    console.log("Seed data: Agregando órdenes iniciales...");
    const orders = [ { 
      customer: "Juan Pérez", 
      subtotal: 220.0, 
      discountTotal: 0, 
      total: 240.0, 
      tip: 20.0, 
      createdAt: "2024-11-29T12:00:00", 
      paymentMethod: "cash", 
      status: "paid", 
      claimedById: 2, 
      billedById: 4, 
      billedAt: "2024-11-29T12:30:00Z" 
    },
    { 
      customer: "María Rodríguez", 
      subtotal: 180.5, 
      discountTotal: 10.0, 
      total: 190.5, 
      tip: 15.0, 
      createdAt: "2024-11-28T18:45:00", 
      paymentMethod: "card", 
      status: "paid", 
      claimedById: 2, 
      billedById: 4, 
      billedAt: "2024-11-28T19:15:00Z" 
    },
    { 
      customer: "Carlos Méndez", 
      subtotal: 350.75, 
      discountTotal: 25.0, 
      total: 345.75, 
      tip: 30.0, 
      createdAt: "2024-11-22T20:30:00", 
      paymentMethod: "cash", 
      status: "paid", 
      claimedById: 2, 
      billedById: 4, 
      billedAt: "2024-11-22T21:00:00Z" 
    },
    { 
      customer: "Ana Torres", 
      subtotal: 95.25, 
      discountTotal: 5.0, 
      total: 105.25, 
      tip: 10.0, 
      createdAt: "2024-10-29T14:15:00", 
      paymentMethod: "card", 
      status: "paid", 
      claimedById: 2, 
      billedById: 4, 
      billedAt: "2024-10-29T14:45:00Z" 
    },
    { 
      customer: "Roberto Guzmán", 
      subtotal: 275.50, 
      discountTotal: 15.0, 
      total: 280.50, 
      tip: 25.0, 
      createdAt: "2024-11-25T19:00:00", 
      paymentMethod: "cash", 
      status: "paid", 
      claimedById: 2, 
      billedById: 4, 
      billedAt: "2024-11-25T19:30:00Z" 
    },
    { 
      customer: "Sofía Herrera", 
      subtotal: 150.75, 
      discountTotal: 0, 
      total: 170.75, 
      tip: 20.0, 
      createdAt: "2024-11-20T13:45:00", 
      paymentMethod: "card", 
      status: "paid", 
      claimedById: 2, 
      billedById: 4, 
      billedAt: "2024-11-20T14:15:00Z" 
    },
    { 
      customer: "Luis Ramírez", 
      subtotal: 420.00, 
      discountTotal: 30.0, 
      total: 415.00, 
      tip: 35.0, 
      createdAt: "2024-11-15T21:30:00", 
      paymentMethod: "cash", 
      status: "paid", 
      claimedById: 2, 
      billedById: 4, 
      billedAt: "2024-11-15T22:00:00Z" 
    },
    { 
      customer: "Elena Castro", 
      subtotal: 110.25, 
      discountTotal: 5.0, 
      total: 125.25, 
      tip: 15.0, 
      createdAt: "2024-11-27T16:20:00", 
      paymentMethod: "card", 
      status: "paid", 
      claimedById: 2, 
      billedById: 4, 
      billedAt: "2024-11-27T16:50:00Z" 
    },
    { 
      customer: "Fernando Morales", 
      subtotal: 265.50, 
      discountTotal: 20.0, 
      total: 260.50, 
      tip: 25.0, 
      createdAt: "2024-10-31T19:45:00", 
      paymentMethod: "cash", 
      status: "paid", 
      claimedById: 2, 
      billedById: 4, 
      billedAt: "2024-10-31T20:15:00Z" 
    },
    { 
      customer: "Isabel Sánchez", 
      subtotal: 190.00, 
      discountTotal: 10.0, 
      total: 200.00, 
      tip: 20.0, 
      createdAt: "2024-11-24T12:30:00", 
      paymentMethod: "card", 
      status: "paid", 
      claimedById: 2, 
      billedById: 4, 
      billedAt: "2024-11-24T13:00:00Z" 
    },
    { 
      customer: "Miguel Jiménez", 
      subtotal: 310.75, 
      discountTotal: 25.0, 
      total: 305.75, 
      tip: 30.0, 
      createdAt: "2024-11-17T20:15:00", 
      paymentMethod: "cash", 
      status: "paid", 
      claimedById: 2, 
      billedById: 4, 
      billedAt: "2024-11-17T20:45:00Z" 
    },
    { 
      customer: "Laura González", 
      subtotal: 135.50, 
      discountTotal: 0, 
      total: 155.50, 
      tip: 20.0, 
      createdAt: "2024-11-26T17:40:00", 
      paymentMethod: "card", 
      status: "paid", 
      claimedById: 2, 
      billedById: 4, 
      billedAt: "2024-11-26T18:10:00Z" 
    },
    { 
      customer: "Pedro Díaz", 
      subtotal: 385.25, 
      discountTotal: 30.0, 
      total: 380.25, 
      tip: 35.0, 
      createdAt: "2024-11-12T21:00:00", 
      paymentMethod: "cash", 
      status: "paid", 
      claimedById: 2, 
      billedById: 4, 
      billedAt: "2024-11-12T21:30:00Z" 
    },
    { 
      customer: "Mónica Ruiz", 
      subtotal: 165.75, 
      discountTotal: 10.0, 
      total: 175.75, 
      tip: 20.0, 
      createdAt: "2024-11-21T15:50:00", 
      paymentMethod: "card", 
      status: "paid", 
      claimedById: 2, 
      billedById: 4, 
      billedAt: "2024-11-21T16:20:00Z" 
    },
    { 
      customer: "Daniel Vargas", 
      subtotal: 240.00, 
      discountTotal: 15.0, 
      total: 245.00, 
      tip: 25.0, 
      createdAt: "2024-11-19T19:30:00", 
      paymentMethod: "cash", 
      status: "paid", 
      claimedById: 2, 
      billedById: 4, 
      billedAt: "2024-11-19T20:00:00Z" 
    },
    { 
      customer: "Carolina Lara", 
      subtotal: 125.50, 
      discountTotal: 5.0, 
      total: 140.50, 
      tip: 15.0, 
      createdAt: "2024-11-23T16:10:00", 
      paymentMethod: "card", 
      status: "paid", 
      claimedById: 2, 
      billedById: 4, 
      billedAt: "2024-11-23T16:40:00Z" 
    },
    { 
      customer: "Ricardo Ortiz", 
      subtotal: 295.25, 
      discountTotal: 20.0, 
      total: 290.25, 
      tip: 30.0, 
      createdAt: "2024-11-14T20:45:00", 
      paymentMethod: "cash", 
      status: "paid", 
      claimedById: 2, 
      billedById: 4, 
      billedAt: "2024-11-14T21:15:00Z" 
    },
    { 
      customer: "Beatriz Navarro", 
      subtotal: 200.75, 
      discountTotal: 10.0, 
      total: 210.75, 
      tip: 20.0, 
      createdAt: "2024-11-18T14:25:00", 
      paymentMethod: "card", 
      status: "paid", 
      claimedById: 2, 
      billedById: 4, 
      billedAt: "2024-11-18T14:55:00Z" 
    },
    { 
      customer: "Jorge Mendoza", 
      subtotal: 175.50, 
      discountTotal: 0, 
      total: 195.50, 
      tip: 20.0, 
      createdAt: "2024-11-16T18:20:00", 
      paymentMethod: "cash", 
      status: "paid", 
      claimedById: 2, 
      billedById: 4, 
      billedAt: "2024-11-16T18:50:00Z" 
    },
    { 
      customer: "Valentina Silva", 
      subtotal: 340.00, 
      discountTotal: 25.0, 
      total: 335.00, 
      tip: 35.0, 
      createdAt: "2024-11-13T21:15:00", 
      paymentMethod: "card", 
      status: "paid", 
      claimedById: 2, 
      billedById: 4, 
      billedAt: "2024-11-13T21:45:00Z" 
    },
    { 
      customer: "Andrés Rojas", 
      subtotal: 145.25, 
      discountTotal: 5.0, 
      total: 160.25, 
      tip: 15.0, 
      createdAt: "2024-11-25T17:30:00", 
      paymentMethod: "cash", 
      status: "paid", 
      claimedById: 2, 
      billedById: 4, 
      billedAt: "2024-11-25T18:00:00Z" 
    },
    { 
      customer: "Natalia Cruz", 
      subtotal: 210.50, 
      discountTotal: 15.0, 
      total: 215.50, 
      tip: 25.0, 
      createdAt: "2024-11-11T20:00:00", 
      paymentMethod: "card", 
      status: "paid", 
      claimedById: 2, 
      billedById: 4, 
      billedAt: "2024-11-11T20:30:00Z" 
    },
    { 
      customer: "Eduardo Reyes", 
      subtotal: 260.75, 
      discountTotal: 20.0, 
      total: 265.75, 
      tip: 30.0, 
      createdAt: "2024-10-30T19:15:00", 
      paymentMethod: "cash", 
      status: "paid", 
      claimedById: 2, 
      billedById: 4, 
      billedAt: "2024-10-30T19:45:00Z" 
    },
    { 
      customer: "Camila Mora", 
      subtotal: 185.00, 
      discountTotal: 10.0, 
      total: 195.00, 
      tip: 20.0, 
      createdAt: "2024-11-27T13:40:00", 
      paymentMethod: "card", 
      status: "paid", 
      claimedById: 2, 
      billedById: 4, 
      billedAt: "2024-11-27T14:10:00Z" 
    },
    { 
      customer: "Rafael Torres", 
      subtotal: 315.50, 
      discountTotal: 25.0, 
      total: 310.50, 
      tip: 35.0, 
      createdAt: "2024-11-10T21:30:00", 
      paymentMethod: "cash", 
      status: "paid", 
      claimedById: 2, 
      billedById: 4, 
      billedAt: "2024-11-10T22:00:00Z" 
    },
    { 
      customer: "Gabriela Fuentes", 
      subtotal: 140.25, 
      discountTotal: 5.0, 
      total: 155.25, 
      tip: 15.0, 
      createdAt: "2024-11-26T15:50:00", 
      paymentMethod: "card", 
      status: "paid", 
      claimedById: 2, 
      billedById: 4, 
      billedAt: "2024-11-26T16:20:00Z" 
    },
    { 
      customer: "Sergio Molina", 
      subtotal: 405.00, 
      discountTotal: 30.0, 
      total: 400.00, 
      tip: 40.0, 
      createdAt: "2024-11-09T20:45:00", 
      paymentMethod: "cash", 
      status: "paid", 
      claimedById: 2, 
      billedById: 4, 
      billedAt: "2024-11-09T21:15:00Z" 
    },
    { 
      customer: "Paula Contreras", 
      subtotal: 170.75, 
      discountTotal: 10.0, 
      total: 180.75, 
      tip: 20.0, 
      createdAt: "2024-11-24T12:10:00", 
      paymentMethod: "card", 
      status: "paid", 
      claimedById: 2, 
      billedById: 4, 
      billedAt: "2024-11-24T12:40:00Z" 
    },];

    const insertOrderStmt = db.prepare(`
      INSERT INTO "Order" (customer, subtotal, discountTotal, total, tip, createdAt, paymentMethod, status, claimedById, billedById, billedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    orders.forEach((order) => {
      insertOrderStmt.run(
        order.customer,
        order.subtotal,
        order.discountTotal,
        order.total,
        order.tip,
        order.createdAt,
        order.paymentMethod,
        order.status,
        order.claimedById,
        order.billedById,
        order.billedAt
      );
    });

    console.log("Órdenes agregadas.");

    // Seed para OrderItem
    console.log("Seed data: Agregando items de órdenes iniciales...");
    const orderItems = [
      // Previous items (orders 1-10)
      {
        orderId: 1,
        menuItemId: 1,
        quantity: 2,
        subtotal: 200.0,
        discountApplied: 0,
        total: 200.0,
        comments: "Con extra queso",
      },
      {
        orderId: 1,
        menuItemId: 2,
        quantity: 1,
        subtotal: 120.0,
        discountApplied: 0,
        total: 120.0,
        comments: "Sin cebolla",
      },
      {
        orderId: 2,
        menuItemId: 1,
        quantity: 1,
        subtotal: 100.0,
        discountApplied: 0,
        total: 100.0,
        comments: "",
      },
      {
        orderId: 3,
        menuItemId: 2,
        quantity: 3,
        subtotal: 360.0,
        discountApplied: 0,
        total: 360.0,
        comments: "Bien caliente",
      },
      {
        orderId: 4,
        menuItemId: 1,
        quantity: 2,
        subtotal: 200.0,
        discountApplied: 50.0,
        total: 150.0,
        comments: "Descuento aplicado",
      },
      {
        orderId: 5,
        menuItemId: 2,
        quantity: 1,
        subtotal: 120.0,
        discountApplied: 0,
        total: 120.0,
        comments: "Para llevar",
      },
      {
        orderId: 6,
        menuItemId: 1,
        quantity: 4,
        subtotal: 400.0,
        discountApplied: 0,
        total: 400.0,
        comments: "Orden grande",
      },
      {
        orderId: 7,
        menuItemId: 2,
        quantity: 2,
        subtotal: 240.0,
        discountApplied: 0,
        total: 240.0,
        comments: "Con salsa extra",
      },
      {
        orderId: 8,
        menuItemId: 1,
        quantity: 1,
        subtotal: 100.0,
        discountApplied: 20.0,
        total: 80.0,
        comments: "Mitad descuento",
      },
      {
        orderId: 9,
        menuItemId: 2,
        quantity: 3,
        subtotal: 360.0,
        discountApplied: 0,
        total: 360.0,
        comments: "Para compartir",
      },
      {
        orderId: 10,
        menuItemId: 1,
        quantity: 2,
        subtotal: 200.0,
        discountApplied: 0,
        total: 200.0,
        comments: "Sin picante",
      },
      // Continuing with remaining orders
      {
        orderId: 11,
        menuItemId: 2,
        quantity: 1,
        subtotal: 120.0,
        discountApplied: 0,
        total: 120.0,
        comments: "Rapido por favor",
      },
      {
        orderId: 12,
        menuItemId: 1,
        quantity: 3,
        subtotal: 300.0,
        discountApplied: 0,
        total: 300.0,
        comments: "Trio completo",
      },
      {
        orderId: 13,
        menuItemId: 2,
        quantity: 2,
        subtotal: 240.0,
        discountApplied: 40.0,
        total: 200.0,
        comments: "Descuento especial",
      },
      {
        orderId: 14,
        menuItemId: 1,
        quantity: 1,
        subtotal: 100.0,
        discountApplied: 0,
        total: 100.0,
        comments: "Al natural",
      },
      {
        orderId: 15,
        menuItemId: 2,
        quantity: 4,
        subtotal: 480.0,
        discountApplied: 0,
        total: 480.0,
        comments: "Orden familiar",
      },
      {
        orderId: 16,
        menuItemId: 1,
        quantity: 2,
        subtotal: 200.0,
        discountApplied: 30.0,
        total: 170.0,
        comments: "Precio especial",
      },
      {
        orderId: 17,
        menuItemId: 2,
        quantity: 1,
        subtotal: 120.0,
        discountApplied: 0,
        total: 120.0,
        comments: "Sin adiciones",
      },
      {
        orderId: 18,
        menuItemId: 1,
        quantity: 3,
        subtotal: 300.0,
        discountApplied: 0,
        total: 300.0,
        comments: "Extras incluidos",
      },
      {
        orderId: 19,
        menuItemId: 2,
        quantity: 2,
        subtotal: 240.0,
        discountApplied: 20.0,
        total: 220.0,
        comments: "Casi gratis",
      },
      {
        orderId: 20,
        menuItemId: 1,
        quantity: 1,
        subtotal: 100.0,
        discountApplied: 0,
        total: 100.0,
        comments: "Clásico",
      },
      {
        orderId: 21,
        menuItemId: 2,
        quantity: 3,
        subtotal: 360.0,
        discountApplied: 0,
        total: 360.0,
        comments: "Fin de semana",
      },
      {
        orderId: 22,
        menuItemId: 1,
        quantity: 2,
        subtotal: 200.0,
        discountApplied: 50.0,
        total: 150.0,
        comments: "Gran oferta",
      },
      {
        orderId: 23,
        menuItemId: 2,
        quantity: 1,
        subtotal: 120.0,
        discountApplied: 0,
        total: 120.0,
        comments: "A la carta",
      },
      {
        orderId: 24,
        menuItemId: 1,
        quantity: 4,
        subtotal: 400.0,
        discountApplied: 0,
        total: 400.0,
        comments: "Grupo grande",
      },
      {
        orderId: 25,
        menuItemId: 2,
        quantity: 2,
        subtotal: 240.0,
        discountApplied: 40.0,
        total: 200.0,
        comments: "Mitad de precio",
      },
      {
        orderId: 26,
        menuItemId: 1,
        quantity: 1,
        subtotal: 100.0,
        discountApplied: 0,
        total: 100.0,
        comments: "Solo uno",
      },
      {
        orderId: 27,
        menuItemId: 2,
        quantity: 3,
        subtotal: 360.0,
        discountApplied: 0,
        total: 360.0,
        comments: "Para toda la familia",
      },
      {
        orderId: 28,
        menuItemId: 1,
        quantity: 2,
        subtotal: 200.0,
        discountApplied: 20.0,
        total: 180.0,
        comments: "Último de la lista",
      }
    ];

    const insertOrderItemStmt = db.prepare(`
      INSERT INTO OrderItem (orderId, menuItemId, quantity, subtotal, discountApplied, total, comments)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    orderItems.forEach((item) => {
      insertOrderItemStmt.run(
        item.orderId,
        item.menuItemId,
        item.quantity,
        item.subtotal,
        item.discountApplied,
        item.total,
        item.comments
      );
    });

    console.log("Items de órdenes agregados.");
  }
};

export default seed;
