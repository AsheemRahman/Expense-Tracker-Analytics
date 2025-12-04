import { Request, Response, NextFunction } from 'express';
import { STATUS_CODES } from "../constants/statusCode";
import { ERROR_MESSAGES } from '../constants/errorMessage';

import JwtUtility from "../utils/JwtUtility";


declare module "express-serve-static-core" {
    interface Request {
        userId?: string;
        email?: string;
    }
}


const authMiddleware = () => {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const authHeader = req.headers.authorization;
            const Token = authHeader?.startsWith("Bearer ") ? authHeader.split(" ")[1] : req.cookies?.accessToken;

            if (!Token) {
                res.status(STATUS_CODES.UNAUTHORIZED).json({ message: ERROR_MESSAGES.TOKEN_NOT_FOUND });
                return;
            }

            // Verify token
            const decoded = JwtUtility.verifyToken(Token) as { userId: string; email: string };

            if (!decoded || !decoded.userId) {
                res.status(STATUS_CODES.FORBIDDEN).json({ message: "Invalid token" });
                return;
            }

            req.userId = decoded.userId;
            req.email = decoded.email;
            next();

        } catch (error) {
            console.error("Auth middleware error:", error);
            res.status(STATUS_CODES.UNAUTHORIZED).json({ message: ERROR_MESSAGES.INTERNAL_SERVER_ERROR });
        }
    };
};

export default authMiddleware;