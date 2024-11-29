import {jwtDecode} from "jwt-decode";

const TOKEN_KEY = "token";

interface TokenPayload {
    role: string;
    email: string;
    name: string;
    lastName: string;
    id: number;
    iat: number;
    exp: number;
    [key: string]: string | number;
}

class TokenService {
    /**
     * Save token to localStorage
     * @param {string} token - The JWT token to save
     */
    static setToken(token: string): void {
        localStorage.setItem(TOKEN_KEY, token);
    }

    /**
     * Retrieve token from localStorage
     * @returns {string | null} - The stored token or null if not found
     */
    static getToken(): string | null {
        return localStorage.getItem(TOKEN_KEY);
    }

    /**
     * Remove token from localStorage
     */
    static clearToken(): void {
        localStorage.removeItem(TOKEN_KEY);
    }

    /**
     * Decode token to extract its payload
     * @returns {TokenPayload | null} - Decoded token payload or null if token is invalid
     */
    static decodeToken(): TokenPayload | null {
        const token = this.getToken();
        if (!token) return null;

        try {
            return jwtDecode<TokenPayload>(token);
        } catch (error) {
            console.error("Failed to decode token:", error);
            return null;
        }
    }

    /**
     * Check if the token is valid and not expired
     * @returns {boolean} - True if token is valid, otherwise false
     */
    static isTokenValid(): boolean {
        const decoded = this.decodeToken();
        if (!decoded || !decoded.exp) return false;

        const currentTime = Math.floor(Date.now() / 1000);
        return decoded.exp > currentTime;
    }

    /**
     * Get user information from the token
     * @returns {Partial<TokenPayload> | null} - User info from the token or null if invalid
     */
    static getUserInfo(): Partial<TokenPayload> | null {
        const decoded = this.decodeToken();
        if (!decoded) return null;

        // Return specific properties or the full payload
        const { role, email, name, lastName, id } = decoded;
        return { role, email, name, lastName, id };
    }
}

export default TokenService;