import { Router } from "express";
import Agent from '../entities/LoginEntities/Agent.js'
import {generateJwtPayload, generateToken} from "../utils/token.js";
import {authenticate} from "../middleware/auth.js";

const router = Router();

router.post("/", async (req, res) => {
    const {email, pin} = req.body;
    if (!email || !pin) {
        return res.status(400).json({
            status: 'error',
            message: 'Missing required fields: email, pin are required.',
        });
    }
    try {
        let agent = await Agent.authenticate(email, pin);
        let payload = generateJwtPayload(agent.role, agent.email);
        let token = generateToken(payload,'24h');
        res.status(200).json({
            token: token
        });
    } catch (error) {
        res.status(500).json({error: error.message});
    }
});

router.get("/", authenticate, async (req, res) => {
    try {
        res.status(200).json({
            message: 'valid',
        });
    } catch (error) {
        res.status(500).json({error: error.message});
    }
});
export default router;