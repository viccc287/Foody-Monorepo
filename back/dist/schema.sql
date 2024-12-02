CREATE TABLE IF NOT EXISTS Agent (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    lastName TEXT NOT NULL,
    image TEXT NOT NULL DEFAULT '',
    address TEXT NOT NULL,
    phone TEXT NOT NULL,
    rfc TEXT,
    email TEXT NOT NULL,
    pin TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('manager', 'cashier', 'waiter', 'cook')),
    isActive BOOLEAN DEFAULT 1
);

CREATE TABLE IF NOT EXISTS MenuItem (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    quantity DECIMAL NOT NULL,
    unit TEXT NOT NULL,
    isActive BOOLEAN DEFAULT 1,
    categoryId INTEGER NOT NULL,
    printLocations TEXT, -- JSON string
    variablePrice BOOLEAN DEFAULT 0,
    price DECIMAL NOT NULL

    -- FOREIGN KEY (categoryId) REFERENCES Category (id)
);

CREATE TABLE IF NOT EXISTS StockItem (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    stock DECIMAL NOT NULL,
    minStock DECIMAL DEFAULT 0,
    unit TEXT NOT NULL,
    isActive BOOLEAN DEFAULT 1,
    categoryId INTEGER NOT NULL,
    supplierId INTEGER NOT NULL,
    cost DECIMAL NOT NULL

    --FOREIGN KEY (supplierId) REFERENCES Supplier (id),
    --FOREIGN KEY (categoryId) REFERENCES Category (id)
);

CREATE TABLE IF NOT EXISTS Ingredients (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    menuItemId INTEGER NOT NULL,
    inventoryProductId INTEGER NOT NULL,
    quantityUsed DECIMAL NOT NULL,
    FOREIGN KEY (menuItemId) REFERENCES MenuItem (id) ON DELETE CASCADE,
    FOREIGN KEY (inventoryProductId) REFERENCES StockItem (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "Order" (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer TEXT NOT NULL,
    subtotal DECIMAL NOT NULL,
    discountTotal DECIMAL DEFAULT 0,
    total DECIMAL NOT NULL,
    tip DECIMAL DEFAULT 0,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    paymentMethod TEXT CHECK (paymentMethod IN ('cash', 'card')),
    cancelledById INTEGER,
    cancelledAt DATETIME,
    cancelReason TEXT,
    status TEXT NOT NULL CHECK (status IN ('active', 'paid', 'cancelled', 'unpaid')),
    claimedById INTEGER,
    billedById INTEGER,
    billedAt DATETIME,
    ready BOOLEAN DEFAULT 0
    -- FOREIGN KEY (claimedById) REFERENCES Agent (id),
    -- FOREIGN KEY (billedById) REFERENCES Agent (id)
);


CREATE TABLE IF NOT EXISTS OrderItem (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    menuItemId INTEGER NOT NULL,
    orderId INTEGER NOT NULL,
    promoId INTEGER,
    quantity INTEGER NOT NULL,
    subtotal DECIMAL NOT NULL,
    discountApplied DECIMAL DEFAULT 0,
    total DECIMAL NOT NULL,
    promoName TEXT,
    comments TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    quantityHistory TEXT DEFAULT '[]',
    appliedPromos TEXT DEFAULT '[]',
    readyQuantity INTEGER DEFAULT 0,

    FOREIGN KEY (orderId) REFERENCES "Order" (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS Promo (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    menuItemId INTEGER NOT NULL,
    startDate DATETIME NOT NULL,
    endDate DATETIME NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('price_discount','percentage_discount', 'buy_x_get_y')),
    discount DECIMAL ,
    buy_quantity INTEGER,
    pay_quantity INTEGER,
    percentage DECIMAL,
    always BOOLEAN DEFAULT 0,
    isActive BOOLEAN DEFAULT 1,
    name TEXT NOT NULL,
    FOREIGN KEY (menuItemId) REFERENCES MenuItem (id) ON DELETE CASCADE
);



CREATE TABLE IF NOT EXISTS RecurrentDate (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    promoId INTEGER NOT NULL,
    dayOfWeek TEXT NOT NULL,
    startTime TIME NOT NULL,
    endTime TIME NOT NULL,
    FOREIGN KEY (promoId) REFERENCES Promo (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS Category (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    type TEXT NOT NULL CHECK (type IN ('menu', 'stock'))
);

CREATE TABLE IF NOT EXISTS Supplier (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    phone TEXT,
    email TEXT,
    address TEXT
);


INSERT INTO Category (id, name, description, type)
VALUES
    (-2, 'Sin clasificar', 'Categoría para productos de menú sin clasificar', 'menu'),
    (-1, 'Sin clasificar', 'Categoría para productos de inventario sin clasificar', 'stock');

INSERT INTO Agent (name, lastName, image, address, phone, rfc, email, pin, role, isActive) 
VALUES 
('Administrador', '1', '', 'Calle Principal 123, Ciudad', '5544332211', 'ADMI900101ABC', 'admin@admin.com', '1234', 'manager', 1),
('Cajero', '1', '', 'Avenida Reforma 456, Ciudad', '5566778899', 'CAJE920202XYZ', 'cajero@cajero.com', '1234', 'cashier', 1),
('Mesero', '1', '', 'Calle Hidalgo 789, Ciudad', '5522113344', 'MESE910303DEF', 'mesero@mesero.com', '1234', 'waiter', 1),
('Cocinero', '1', '', 'Boulevard Juárez 321, Ciudad', '5533445566', 'COCI880404GHI', 'cocinero@cocinero.com', '1234', 'cook', 1);

INSERT INTO Supplier (id, name)
VALUES 
(1,'Proveedor genérico');

INSERT INTO StockItem (id, name, stock, minStock, unit, isActive, categoryId, supplierId, cost) 
VALUES 
(1,'Harina', 50.0, 5.0, 'kg', 1, -1, 1, 20.0), 
(2,'Tomate', 100.0, 10.0, 'kg', 1, -1, 1, 15.0), 
(3,'Queso', 30.0, 5.0, 'kg', 1, -1, 1, 50.0), 
(4,'Aceite', 20.0, 3.0, 'l', 1, -1, 1, 80.0);

INSERT INTO MenuItem (id, name, quantity, unit, isActive, categoryId, printLocations, variablePrice, price) 
VALUES 
(1,'Pizza Margarita', 1, 'porción', 1, -2, '["Cocina"]', 0, 120.0), 
(2,'Ensalada Caprese', 1, 'porción', 1, -2, '["Cocina"]', 0, 90.0), 
(3,'Pasta Carbonara', 1, 'porción', 1, -2, '["Cocina"]', 0, 140.0), 
(4,'Sopa de Tomate', 1, 'porción', 1, -2, '["Cocina"]', 0, 80.0);

INSERT INTO Ingredients (menuItemId, inventoryProductId, quantityUsed) 
VALUES 
(1, 1, 0.25), -- Pizza Margarita usa 250g de harina
(1, 3, 0.2),  -- Pizza Margarita usa 200g de queso
(2, 2, 0.5),  -- Ensalada Caprese usa 500g de tomate
(2, 3, 0.3),  -- Ensalada Caprese usa 300g de queso
(3, 1, 0.15), -- Pasta Carbonara usa 150g de harina
(3, 4, 0.1),  -- Pasta Carbonara usa 100ml de aceite
(4, 2, 0.4),  -- Sopa de Tomate usa 400g de tomate
(4, 4, 0.05); -- Sopa de Tomate usa 50ml de aceite
