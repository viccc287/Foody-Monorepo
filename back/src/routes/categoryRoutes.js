// FILE: categoryRoutes.js

import { Router } from "express";
import Category from "../entities/CategoryEntities/Category";

const router = Router();

// Get all categories or by type
router.get("/", (req, res) => {
    try {
        const { type } = req.query;
        let categories;
        if (type) categories = Category.getAllByType(type);
        else categories = Category.getAll();
        res.json(categories);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch categories. " + error.message });
    }
});


// Get a specific category by ID
router.get("/:id", (req, res) => {
    try {
        const { id } = req.params;
        const category = Category.getById(Number(id));
        if (category) {
            res.json(category);
        } else {
            res.status(404).json({ error: "Category not found." });
        }
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch category. " + error.message });
    }
});

// Create a new category
router.post("/", (req, res) => {
    try {
        const category = new Category(req.body);
        const id = category.save();
        res.status(201).json({ id });
    } catch (error) {
        res.status(500).json({ error: "Failed to create category. " + error.message });
    }
});

// Update an existing category
router.put("/:id", (req, res) => {
    try {
        const { id } = req.params;
        const category = Category.getById(Number(id));
        if (category) {
            Object.assign(category, req.body);
            category.save();
            res.json({ message: "Category updated successfully." });
        } else {
            res.status(404).json({ error: "Category not found." });
        }
    } catch (error) {
        res.status(500).json({ error: "Failed to update category. " + error.message });
    }
});

// Delete a category
router.delete("/:id", (req, res) => {
    try {
        const { id } = req.params;
        const category = Category.getById(Number(id));
        if (category) {
            category.delete();
            res.json({ message: "Category deleted successfully." });
        } else {
            res.status(404).json({ error: "Category not found." });
        }
    } catch (error) {
        console.log(error);
        
        res.status(500).json({ error: "Failed to delete category. " + error.message });
    }
});

export default router;