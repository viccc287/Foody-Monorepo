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

const initialAgents = [
  {
    id: "1",
    name: "Ángeles",
    lastName: "Altez",
    image:
      "https://www.georgetown.edu/wp-content/uploads/2022/02/Jkramerheadshot-scaled-e1645036825432-1050x1050-c-default.jpg",
    address: "Brisas 123, Col. Centro, Ciudad",
    phone: "1234567890",
    rfc: "ABCD123456XYZ",
    email: "angie@example.com",
    pin: "1234",
    role: "admin",
    isActive: true,
  },
  {
    id: "2",
    name: "Eugenia",
    lastName: "Morales",
    image: "",
    address: "Brisas 123, Col. Centro, Ciudad",
    phone: "0987654321",
    rfc: "EFGH789012UVW",
    email: "euge@example.com",
    pin: "5678",
    role: "cashier",
    isActive: true,
  },
  {
    id: "3",
    name: "Marcos",
    lastName: "Cruz",
    image: "https://www.despejandodudas.co/images/2021/Noviembre/Mesero_2.jpg",
    address: "Pinos 123, Col. Centro, Ciudad",
    phone: "0987654321",
    rfc: "EFGH789012UVW",
    email: "marquitos@example.com",
    pin: "5678",
    role: "waiter",
    isActive: true,
  },
];

const seed = () => {
  // Check if Items table is empty
  const itemCountStmt = db.prepare("SELECT COUNT(*) as count FROM Item");
  const itemCount = itemCountStmt.get();

  if (itemCount.count === 0) {
    console.log("Seed data: Adding initial menu items...");

    const insertItemStmt = db.prepare(`
      INSERT INTO Item (name, quantity, unit, isActive, family, supplier, printLocations, variablePrice, recipe, price)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    initialMenuItems.forEach((item) => {
      insertItemStmt.run(
        item.name,
        item.quantity,
        item.unit,
        item.isActive ? 1 : 0,
        item.family,
        item.supplier,
        JSON.stringify(item.printLocations),
        item.variablePrice ? 1 : 0,
        item.recipe,
        item.price
      );
    });
  }

  // Check if Agents table is empty
  const agentCountStmt = db.prepare("SELECT COUNT(*) as count FROM Agent");
  const agentCount = agentCountStmt.get();

  if (agentCount.count === 0) {
    console.log("Seed data: Adding initial agents...");

    const insertAgentStmt = db.prepare(`
      INSERT INTO Agent (name, lastName, image, address, phone, rfc, email, pin, role, isActive)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    initialAgents.forEach((agent) => {
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
  }

  console.log("Seed completed!");
};


export default seed;
