import { Request, Response } from "express";
import { query } from "../config/prisma";
import PasswordUtils from "../utils/passwordUtils";
import JwtUtility from "../utils/JwtUtility";
import { STATUS_CODES } from "../constants/statusCode";
import { ERROR_MESSAGES } from "../constants/errorMessage";


class AuthController {

    async signup(req: Request, res: Response): Promise<void> {
        const { name, email, password } = req.body;
        if (!name || !email || !password) {
            res.status(400).json({ status: false, message: "All fields are required" });
            return;
        }
        try {
            const existing = await query(
                `SELECT id FROM users WHERE email = $1`,
                [email.toLowerCase()]
            );
            if (existing.rows.length > 0) {
                res.status(STATUS_CODES.BAD_REQUEST).json({ status: false, message: "Email already exists" });
                return;
            }
            const hashed = await PasswordUtils.passwordHash(password);
            const result = await query(
                `INSERT INTO users (name, email, password)
                VALUES ($1, $2, $3)
                RETURNING id, name, email`,
                [name, email.toLowerCase(), hashed]
            );
            const user = result.rows[0];
            res.status(STATUS_CODES.CREATED).json({ status: true, message: "User created successfully", user });
        } catch (error) {
            console.error("Signup error:", error);
            res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({ status: false, message: "Signup failed" });
        }
    };

    async login(req: Request, res: Response): Promise<void> {
        const { email, password } = req.body;
        try {
            const result = await query(
                `SELECT id, name, email, password
                FROM users
                WHERE email = $1`,
                [email.toLowerCase()]
            );

            const user = result.rows[0];
            if (!user) {
                res.status(STATUS_CODES.BAD_REQUEST).json({ status: false, message: ERROR_MESSAGES.INVALID_CREDENTIALS });
                return;
            }

            const valid = await PasswordUtils.comparePassword(password, user.password);
            if (!valid) {
                res.status(STATUS_CODES.BAD_REQUEST).json({ status: false, message: ERROR_MESSAGES.INVALID_CREDENTIALS });
                return;
            }
            const token = JwtUtility.generateToken({ userId: String(user.id), email: user.email, });
            res.status(STATUS_CODES.OK).json({ status: true, message: "Logged in successfully", token, user });
        } catch (error) {
            res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({ status: false, message: "Login failed" });
        }
    };
}

export default AuthController;