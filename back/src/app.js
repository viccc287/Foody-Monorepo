import express from "express";
import cors from "cors";
import itemRoutes from "./routes/itemRoutes";
import agentRoutes from "./routes/agentRoutes";
import menuRoutes from "./routes/menuRoutes";
import orderRoutes from "./routes/orderRoutes";
import promoRoutes from "./routes/promoRoutes";
import categoryRoutes from "./routes/categoryRoutes";
import supplierRoutes from "./routes/supplierRoutes";
import authenticateRoutes from "./routes/authenticateRoutes.js";
import orderItemRoutes from "./routes/orderItemRoutes";
import seed from "./database/seed";
import { authenticate } from "./middleware/auth.js";

const app = express();

app.use(express.json());
app.use(cors());
app.use("/authenticate", authenticateRoutes);

app.use(authenticate);

app.use("/items", itemRoutes);
app.use("/agents", agentRoutes);
app.use("/menu", menuRoutes);
app.use("/orders", orderRoutes);
app.use("/order-items", orderItemRoutes);
app.use("/promos", promoRoutes);
app.use("/categories", categoryRoutes)
app.use("/suppliers", supplierRoutes)
app.use('/images', express.static('storage/images'));

seed();
export default app;
