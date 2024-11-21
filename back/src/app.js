import express from "express";
import cors from "cors";
import itemRoutes from "./routes/itemRoutes";
import agentRoutes from "./routes/agentRoutes";
import seed from "./database/seed";

const app = express();

app.use(express.json());
app.use(cors());
app.use("/items", itemRoutes);
app.use("/agents", agentRoutes);
app.use('/images', express.static('storage/images'));

seed();
export default app;
