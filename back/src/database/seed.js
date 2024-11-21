import db from "./connection";

const initialMenuItems = [
  {
    name: "Margherita Pizza",
    quantity: 1,
    unit: "pieza",
    isActive: true,
    family: "Alimentos",
    supplier: "Proveedor Genérico",
    printLocations: ["Cocina"],
    variablePrice: false,
    recipe: '',
    price: 150.5,
  },
  {
    name: "Ron con cola",
    quantity: 1,
    unit: "vaso",
    isActive: true,
    family: "Cocteles",
    supplier: "Proveedor Genérico",
    printLocations: [],
    variablePrice: true,
    recipe: '',
    price: 80.0,
  },
  {
    name: "Coca Cola lata",
    quantity: 1,
    unit: "pieza",
    isActive: true,
    family: "Alimentos",
    supplier: "Proveedor Genérico",
    printLocations: ["Caja"],
    variablePrice: false,
    recipe: '',
    price: 40.0,
  },
  {
    name: "Ron Matusalem",
    quantity: 1,
    unit: "botella",
    isActive: true,
    family: "Ron",
    supplier: "Proveedor Genérico",
    printLocations: [],
    variablePrice: false,
    recipe: '',
    price: 525.5,
  },
];

const seed = () => {
  // Verificar si ya hay datos en la tabla
  const countStmt = db.prepare("SELECT COUNT(*) as count FROM Item");
  const { count } = countStmt.get();

  if (count === 0) {
    console.log("Seed data: Adding initial menu items...");

    const insertStmt = db.prepare(`
      INSERT INTO Item (name, quantity, unit, isActive, family, supplier, printLocations, variablePrice, recipe, price)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    initialMenuItems.forEach((item) => {
      insertStmt.run(
        item.name,
        item.quantity,
        item.unit,
        item.isActive ? 1 : 0,
        item.family,
        item.supplier,
        JSON.stringify(item.printLocations), // Convertimos el arreglo en JSON
        item.variablePrice ? 1 : 0,
        item.recipe,
        item.price
      );
    });

    console.log("Seed data: Initial menu items added successfully.");
  } else {
    console.log("Seed data: Menu items already exist, skipping seed.");
  }
};

export default seed;
