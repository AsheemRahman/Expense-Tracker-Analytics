import jwt, { JwtPayload } from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();


const secret = process.env.JWT_TOKEN_SECRET_KEY as string;


export interface TokenPayload {
    userId: string;
    email: string;
}


class JwtUtility {
    static generateToken(payload: TokenPayload): string {
        return jwt.sign(payload, secret, { expiresIn: '15m' });
    }

    static verifyToken(token: string): string | JwtPayload {
        return jwt.verify(token, secret);
    }
}


export default JwtUtility;