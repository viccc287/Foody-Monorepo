CREATE TABLE IF NOT EXISTS Item (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    quantity DECIMAL NOT NULL,
    unit TEXT NOT NULL,
    isActive BOOLEAN DEFAULT 1,
    family TEXT NOT NULL,
    supplier TEXT NOT NULL,
    printLocations TEXT, 
    variablePrice BOOLEAN DEFAULT 0,
    recipe TEXT,
    price DECIMAL NOT NULL
);

CREATE TABLE IF NOT EXISTS Agent (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    lastName TEXT NOT NULL,
    image TEXT,
    address TEXT NOT NULL,
    phone TEXT NOT NULL,
    rfc TEXT NOT NULL,
    email TEXT NOT NULL,
    pin TEXT NOT NULL,
    role TEXT NOT NULL,
    isActive BOOLEAN DEFAULT 1
);

CREATE TABLE IF NOT EXISTS MenuItem (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    quantity DECIMAL NOT NULL,
    unit TEXT NOT NULL,
    isActive BOOLEAN DEFAULT 1,
    family TEXT NOT NULL,
    supplier TEXT NOT NULL,
    printLocations TEXT, -- JSON string
    variablePrice BOOLEAN DEFAULT 0,
    price DECIMAL NOT NULL
);

CREATE TABLE IF NOT EXISTS StockItem (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    stock DECIMAL NOT NULL,
    unit TEXT NOT NULL,
    isActive BOOLEAN DEFAULT 1,
    family TEXT NOT NULL,
    supplier TEXT NOT NULL,
    cost DECIMAL NOT NULL
);

CREATE TABLE IF NOT EXISTS Ingredients (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    menuItemId INTEGER NOT NULL,
    inventoryProductId INTEGER NOT NULL,
    quantityUsed DECIMAL NOT NULL,
    FOREIGN KEY (menuItemId) REFERENCES MenuItem (id),
    FOREIGN KEY (inventoryProductId) REFERENCES StockItem (id)
);

CREATE TABLE IF NOT EXISTS "Order" (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer TEXT NOT NULL,
    subtotal DECIMAL NOT NULL,
    discountTotal DECIMAL DEFAULT 0,
    total DECIMAL NOT NULL,
    tip DECIMAL DEFAULT 0,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    paymentMethod TEXT NOT NULL,
    cancelledAt DATETIME,
    cancelReason TEXT,
    status TEXT NOT NULL CHECK (status IN ('active', 'paid', 'cancelled', 'unpaid')),
    claimedById INTEGER,
    billedById INTEGER,
    FOREIGN KEY (claimedById) REFERENCES Agent (id),
    FOREIGN KEY (billedById) REFERENCES Agent (id)
);


CREATE TABLE IF NOT EXISTS OrderItem (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    menuItemId INTEGER NOT NULL,
    orderId INTEGER NOT NULL,
    promoId INTEGER,
    quantity INTEGER NOT NULL,
    subtotal DECIMAL NOT NULL,
    discountApplied DECIMAL DEFAULT 0,
    promoName TEXT,
    comments TEXT,
    FOREIGN KEY (menuItemId) REFERENCES MenuItem (id),
    FOREIGN KEY (orderId) REFERENCES "Order" (id)
);

CREATE TABLE IF NOT EXISTS Promo (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    menuItemId INTEGER NOT NULL,
    startDate DATETIME NOT NULL,
    endDate DATETIME NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('discount', 'buy_x_get_y')),
    discount DECIMAL DEFAULT 0,
    buy_quantity INTEGER,
    pay_quantity INTEGER,
    percentage DECIMAL DEFAULT 0,
    always BOOLEAN DEFAULT 0,
    isActive BOOLEAN DEFAULT 1,
    name TEXT NOT NULL,
    FOREIGN KEY (menuItemId) REFERENCES MenuItem (id)
);



CREATE TABLE IF NOT EXISTS RecurrentDate (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    promoId INTEGER NOT NULL,
    days_of_week TEXT NOT NULL,
    startTime TIME NOT NULL,
    endTime TIME NOT NULL,
    FOREIGN KEY (promoId) REFERENCES Promo (id)
);

