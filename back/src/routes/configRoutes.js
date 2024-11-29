import { Router } from "express";

const router = Router();

router.get("/", (req, res) => {
  try {
    const config = {
      restaurantName: process.env.RESTAURANT_NAME,
      securityPin: process.env.SECURITY_PIN,
    };
    res.json(config);
  } catch (error) {
    res.status(500).json({ error: "Error al leer la configuración" });
  }
});

export default router;
