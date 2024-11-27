
import { Router } from "express";
import Supplier from "../entities/SupplierEntities/Supplier";

const router = Router();

// Get all suppliers
router.get("/", (req, res) => {
    try {
        const suppliers = Supplier.getAll();
        res.json(suppliers);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch suppliers. " + error.message });
    }
});

// Get a specific supplier by ID
router.get("/:id", (req, res) => {
    try {
        const { id } = req.params;
        const supplier = Supplier.getById(Number(id));
        if (supplier) {
            res.json(supplier);
        } else {
            res.status(404).json({ error: "Supplier not found." });
        }
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch supplier. " + error.message });
    }
});

// Create a new supplier
router.post("/", (req, res) => {
    try {
        const supplier = new Supplier(req.body);
        const id = supplier.save();
        res.status(201).json({ id });
    } catch (error) {
        res.status(500).json({ error: "Failed to create supplier. " + error.message });
    }
});

// Update an existing supplier
router.put("/:id", (req, res) => {
    try {
        const { id } = req.params;
        const supplier = Supplier.getById(Number(id));
        if (supplier) {
            Object.assign(supplier, req.body);
            supplier.save();
            res.json({ message: "Supplier updated successfully." });
        } else {
            res.status(404).json({ error: "Supplier not found." });
        }
    } catch (error) {
        res.status(500).json({ error: "Failed to update supplier. " + error.message });
    }
});

// Delete a supplier
router.delete("/:id", (req, res) => {
    try {
        const { id } = req.params;
        const supplier = Supplier.getById(Number(id));
        if (supplier) {
            supplier.delete();
            res.json({ message: "Supplier deleted successfully." });
        } else {
            res.status(404).json({ error: "Supplier not found." });
        }
    } catch (error) {
        res.status(500).json({ error: "Failed to delete supplier. " + error.message });
    }
});

export default router;