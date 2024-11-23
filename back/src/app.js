import express from "express";
import cors from "cors";
import itemRoutes from "./routes/itemRoutes";
import agentRoutes from "./routes/agentRoutes";
import menuRoutes from "./routes/menuRoutes";
import orderRoutes from "./routes/orderRoutes";
import promoRoutes from "./routes/promoRoutes";
import seed from "./database/seed";

const app = express();

app.use(express.json());
app.use(cors());
app.use("/items", itemRoutes);
app.use("/agents", agentRoutes);
app.use("/menu", menuRoutes);
app.use("/orders", orderRoutes);
app.use("/promos", promoRoutes);
app.use('/images', express.static('storage/images'));

seed();
export default app;
