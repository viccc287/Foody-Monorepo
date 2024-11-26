import db from "./connection";


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
