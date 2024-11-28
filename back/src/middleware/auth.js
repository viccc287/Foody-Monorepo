import {verifyToken} from "../utils/token.js";

export const authenticate = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ message: "Unauthorized: No token provided" });
        }
        const token = authHeader.split(" ")[1];
        const decoded = verifyToken(token);

        req.user = decoded;

        next();
    } catch (err) {
        res.status(401).json({ message: "Unauthorized: Invalid or expired token" });
    }
};