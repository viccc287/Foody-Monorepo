import app from "./app";
import { Server } from "socket.io";
import { createServer } from "http";

const PORT = 3000;

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

io.on("connection", (socket) => {
  console.log("Client connected");
  
  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});

// Export io instance to use in routes
export { io };

httpServer.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});