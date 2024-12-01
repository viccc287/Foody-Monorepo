// server.js
import app from "./app.js";
import http from "http";
import { Server } from "socket.io";

const PORT = 3000;

// Crear servidor HTTP a partir de tu aplicación Express
const server = http.createServer(app);

// Configurar Socket.IO con el servidor HTTP
const io = new Server(server, {
  cors: {
    origin: "*", // Configura esto según tus necesidades de seguridad
    methods: ["GET", "POST"],
  },
});

// Hacer que la instancia de Socket.IO esté disponible en la aplicación
app.set("io", io);

// Iniciar el servidor en el puerto especificado
server.listen(PORT, () => {
  console.log(process.env.RESTAURANT_NAME);
  console.log(`Server is running on http://localhost:${PORT}`);
});