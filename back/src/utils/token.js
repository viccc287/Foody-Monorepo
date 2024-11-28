import jwt from "jsonwebtoken";

import dotenv from "dotenv";
dotenv.config();

const secretKey = process.env.JWT_SECRET_KEY;

export const generateToken = (payload, expiresIn = "24h") => {
    try {
        const token = jwt.sign(payload, secretKey, { expiresIn });
        return token;
    } catch (error) {
        throw new Error(`Error generating token: ${error.message}`);
    }
};

export const verifyToken = (token) => {
    try {
        return jwt.verify(token, secretKey);
    } catch (err) {
        throw new Error("Invalid or expired token.");
    }
};

export const generateJwtPayload = (role, email) => {
    let payload = {
        role: role,
        email: email,
    }
    return payload;
};