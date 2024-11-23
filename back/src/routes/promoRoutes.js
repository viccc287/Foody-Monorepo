import { Router } from "express";
import Promo from "../entities/PromoEntities/Promo";

const router = Router();

router.get("/", (req, res) => {
    try {
        const promos = Promo.getAll();
        res.json(promos);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch promos." });
    }
});

router.post("/", (req, res) => {
    try {
        const promo = new Promo(req.body);
        const id = promo.save();
        res.status(201).json({ id });
    } catch (error) {
        res.status(500).json({ error: "Failed to create promo." });
    }
});

router.get("/recurrent-dates", (req, res) => {
    try {
        const recurrentDates = RecurrentDate.getAll();
        res.json(recurrentDates);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch recurrent dates." });
    }
});

router.post("/recurrent-dates", (req, res) => {
    try {
        const recurrentDate = new RecurrentDate(req.body);
        const id = recurrentDate.save();
        res.status(201).json({ id });
    } catch (error) {
        res.status(500).json({ error: "Failed to create recurrent date." });
    }
});

export default router;
