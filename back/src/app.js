import express from "express";
import cors from "cors";
import itemRoutes from "./routes/itemRoutes";
import seed from "./database/seed";

const app = express();

app.use(express.json());
app.use(cors());
app.use("/items", itemRoutes);

seed();
export default app;
