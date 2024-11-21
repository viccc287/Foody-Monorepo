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
