import { Router } from "express";
import Promo from "../entities/PromoEntities/Promo";

const router = Router();

import { Router } from "express";
import Promo from "../models/Promo";
import RecurrentDate from "../models/RecurrentDate";


/**
 * Routes for Promo
 */

// Get all promotions
router.get("/promos", (req, res) => {
    try {
        const promos = Promo.getAll();
        res.json(promos);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch promotions." });
    }
});

// Get a specific promotion by ID
router.get("/promos/:id", (req, res) => {
    try {
        const { id } = req.params;
        const promo = Promo.getById(Number(id));
        if (promo) {
            res.json(promo);
        } else {
            res.status(404).json({ error: "Promotion not found." });
        }
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch promotion." });
    }
});

// Create a new promotion
router.post("/promos", (req, res) => {
    try {
        const promo = new Promo(req.body);
        const id = promo.save();
        res.status(201).json({ id });
    } catch (error) {
        res.status(500).json({ error: "Failed to create promotion." });
    }
});

// Update an existing promotion
router.put("/promos/:id", (req, res) => {
    try {
        const { id } = req.params;
        const promo = Promo.getById(Number(id));
        if (promo) {
            Object.assign(promo, req.body);
            promo.save();
            res.json({ message: "Promotion updated successfully." });
        } else {
            res.status(404).json({ error: "Promotion not found." });
        }
    } catch (error) {
        res.status(500).json({ error: "Failed to update promotion." });
    }
});

// Delete a promotion and its associated recurrence rules
router.delete("/promos/:id", (req, res) => {
    try {
        const { id } = req.params;
        const promo = Promo.getById(Number(id));
        if (promo) {
            promo.delete();
            res.json({ message: "Promotion deleted successfully." });
        } else {
            res.status(404).json({ error: "Promotion not found." });
        }
    } catch (error) {
        res.status(500).json({ error: "Failed to delete promotion." });
    }
});

/**
 * Routes for RecurrentDate Associated with Promo
 */

// Get all recurrence rules for a specific promotion
router.get("/promos/:id/recurrence-rules", (req, res) => {
    try {
        const { id } = req.params;
        const promo = Promo.getById(Number(id));
        if (promo) {
            const recurrenceRules = promo.getRecurrenceRules();
            res.json(recurrenceRules);
        } else {
            res.status(404).json({ error: "Promotion not found." });
        }
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch recurrence rules." });
    }
});

// Create a new recurrence rule for a specific promotion
router.post("/promos/:id/recurrence-rules", (req, res) => {
    try {
        const { id } = req.params;
        const promo = Promo.getById(Number(id));
        if (promo) {
            const recurrenceRule = new RecurrentDate({
                ...req.body,
                promoId: Number(id),
            });
            const recurrenceId = recurrenceRule.save();
            res.status(201).json({ recurrenceId });
        } else {
            res.status(404).json({ error: "Promotion not found." });
        }
    } catch (error) {
        res.status(500).json({ error: "Failed to create recurrence rule." });
    }
});

// Update a recurrence rule
router.put("/promos/recurrence-rules/:id", (req, res) => {
    try {
        const { id } = req.params;
        const recurrenceRule = RecurrentDate.getById(Number(id));
        if (recurrenceRule) {
            Object.assign(recurrenceRule, req.body);
            recurrenceRule.save();
            res.json({ message: "Recurrence rule updated successfully." });
        } else {
            res.status(404).json({ error: "Recurrence rule not found." });
        }
    } catch (error) {
        res.status(500).json({ error: "Failed to update recurrence rule." });
    }
});

// Delete a recurrence rule
router.delete("/promos/recurrence-rules/:id", (req, res) => {
    try {
        const { id } = req.params;
        const recurrenceRule = RecurrentDate.getById(Number(id));
        if (recurrenceRule) {
            recurrenceRule.delete();
            res.json({ message: "Recurrence rule deleted successfully." });
        } else {
            res.status(404).json({ error: "Recurrence rule not found." });
        }
    } catch (error) {
        res.status(500).json({ error: "Failed to delete recurrence rule." });
    }
});



// ============ Recurrent dates routes ==============



// Get all recurrent dates
router.get("/recurrent-dates", (req, res) => {
    try {
        const recurrentDates = RecurrentDate.getAll();
        res.json(recurrentDates);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch recurrent dates." });
    }
});

// Get all recurrent dates for a specific promo
router.get("/recurrent-dates/promo/:promoId", (req, res) => {
    try {
        const { promoId } = req.params;
        const recurrentDates = RecurrentDate.getByPromoId(Number(promoId));
        res.json(recurrentDates);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch recurrent dates for promo." });
    }
});

// Create a new recurrent date
router.post("/recurrent-dates", (req, res) => {
    try {
        const recurrentDate = new RecurrentDate(req.body);
        const id = recurrentDate.save();
        res.status(201).json({ id });
    } catch (error) {
        res.status(500).json({ error: "Failed to create recurrent date." });
    }
});

// Update a recurrent date
router.put("/recurrent-dates/:id", (req, res) => {
    try {
        const { id } = req.params;
        const recurrentDate = RecurrentDate.getById(Number(id));
        if (recurrentDate) {
            Object.assign(recurrentDate, req.body);
            recurrentDate.save();
            res.json({ message: "RecurrentDate updated successfully." });
        } else {
            res.status(404).json({ error: "RecurrentDate not found." });
        }
    } catch (error) {
        res.status(500).json({ error: "Failed to update recurrent date." });
    }
});

// Delete a recurrent date
router.delete("/recurrent-dates/:id", (req, res) => {
    try {
        const { id } = req.params;
        const recurrentDate = RecurrentDate.getById(Number(id));
        if (recurrentDate) {
            recurrentDate.delete();
            res.json({ message: "RecurrentDate deleted successfully." });
        } else {
            res.status(404).json({ error: "RecurrentDate not found." });
        }
    } catch (error) {
        res.status(500).json({ error: "Failed to delete recurrent date." });
    }
});

export default router;

