import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

// Secret key for signing the token (store this securely, e.g., in environment variables)
const SECRET_KEY = "alvin";

interface TokenPayload {
  userId: string;
}

// Function to create a token
export function createToken(payload: TokenPayload): string {
  return jwt.sign(payload, SECRET_KEY, { expiresIn: "7d" });
}

// Middleware to verify the token
export function verifyToken(req: Request, res: Response, next: NextFunction) {
  const token = req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    return res.status(401).json({ error: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY) as TokenPayload;
    (req as any).user = decoded; // Add the decoded payload to the request object
    next();
  } catch (error) {
    return res.status(401).json({ error: "Invalid token" });
  }
}

export function verifyTokenEmail(params: string) {
  const token = params;
  if (!token) {
    return null;
  }
  try {
    const decoded = jwt.verify(token, SECRET_KEY) as TokenPayload;
    return decoded;
  } catch (error) {
    throw error;
  }
}
