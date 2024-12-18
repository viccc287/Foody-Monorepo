// server.js
import app from "./app.js";
import http from "http";
import { Server } from "socket.io";

const PORT = 3000;
const IP_ADDRESS = process.env.IP_ADDRESS || "localhost"

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

app.set("io", io);

io.on("connection", (socket) => {
  console.log("A user connected", socket.handshake.address, new Date().toLocaleString());
  socket.on("disconnect", () => {
    console.log("A user disconnected", socket.handshake.address, new Date().toLocaleString());
  });
});

server.listen(PORT, IP_ADDRESS, () => {
  console.log(process.env.RESTAURANT_NAME || "Restaurant");
  console.log(`Server is running on http://${IP_ADDRESS}:${PORT}`);
});
