import { Router } from "express";
import db from "../database/connection.js";
import multer from "multer";
import path from "path";
import fs from "fs";

const router = Router();

// Get all agents
router.get("/", (req, res) => {
  const stmt = db.prepare("SELECT * FROM Agent");
  const agents = stmt.all();

  const parsedAgents = agents.map((agent) => ({
    ...agent,
    isActive: !!agent.isActive, // Convert 1/0 to true/false
  }));

  res.json(parsedAgents);
});

router.get("/names", (req, res) => {
  const stmt = db.prepare("SELECT id, name, lastName FROM Agent");
  const agents = stmt.all();

  res.json(agents);
});

router.post("/", (req, res) => {
  const {
    name,
    lastName,
    image,
    address,
    phone,
    rfc,
    email,
    pin,
    role,
    isActive,
  } = req.body;

  const stmt = db.prepare(
    `INSERT INTO Agent (name, lastName, image, address, phone, rfc, email, pin, role, isActive)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  );

  const result = stmt.run(
    name,
    lastName,
    image,
    address,
    phone,
    rfc,
    email,
    pin,
    role,
    isActive ? 1 : 0
  );

  res.json({ id: result.lastInsertRowid });
  console.log(`Agent ADDED by USER at ${new Date().toLocaleString("es-MX")}`);
});

// Update an existing agent
router.put("/:id", (req, res) => {
  const { id } = req.params;
  const {
    name,
    lastName,
    image,
    address,
    phone,
    rfc,
    email,
    pin,
    role,
    isActive,
  } = req.body;

  const stmt = db.prepare(
    `UPDATE Agent
     SET name = ?, lastName = ?, image = ?, address = ?, phone = ?, rfc = ?, email = ?, pin = ?, role = ?, isActive = ?
     WHERE id = ?`
  );

  const result = stmt.run(
    name,
    lastName,
    image,
    address,
    phone,
    rfc,
    email,
    pin,
    role,
    isActive ? 1 : 0,
    id
  );

  if (result.changes > 0) {
    res.json({ message: "Agent updated successfully" });
    console.log(
      `Agent UPDATED by USER at ${new Date().toLocaleString("es-MX")}`
    );
  } else {
    res.status(404).json({ error: "Agent not found" });
  }
});

// Delete an agent
router.delete("/:id", (req, res) => {
  const { id } = req.params;

  const stmt = db.prepare("DELETE FROM Agent WHERE id = ?");
  const result = stmt.run(id);

  if (result.changes > 0) {
    res.json({ message: "Agent deleted successfully" });
    console.log(
      `Agent DELETED by USER at ${new Date().toLocaleString("es-MX")}`
    );
  } else {
    res.status(404).json({ error: "Agent not found" });
  }
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = "storage/images";
    // Create directory if it doesn't exist
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename with timestamp
    const uniqueName = `agent-${Date.now()}-${Math.round(
      Math.random() * 1e9
    )}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

// Configure upload middleware
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp/;
    const extname = allowedTypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Only JPEG, PNG and WEBP allowed."));
    }
  },
});

// Update the upload route
router.post("/upload-image", upload.single("image"), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const imageUrl = `http://localhost:3000/images/${req.file.filename}`;
    res.json({ imageUrl });

    console.log(
      `Image uploaded by USER at ${new Date().toLocaleString("es-MX")}`
    );
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ error: "Failed to upload image" });
  }
});

export default router;
