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
