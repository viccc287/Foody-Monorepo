import express from "express";
import cors from "cors";
import itemRoutes from "./routes/itemRoutes.js";
import agentRoutes from "./routes/agentRoutes.js";
import menuRoutes from "./routes/menuRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import promoRoutes from "./routes/promoRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import supplierRoutes from "./routes/supplierRoutes.js";
import authenticateRoutes from "./routes/authenticateRoutes.js";
import orderItemRoutes from "./routes/orderItemRoutes.js";
import configRoutes from "./routes/configRoutes.js";
import { authenticate } from "./middleware/auth.js";
import path from "path";

const app = express();

app.use(express.json());
app.use(cors());

app.use((req, res, next) => {
    req.io = app.get("io");
    next();
  });
  
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
app.use("/config", configRoutes)
app.use('/images', express.static('storage/images'));

export default app;
