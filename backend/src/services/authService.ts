import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import { JwtPayload } from "../types/auth";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "24h";
const BCRYPT_SALT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS || "10", 10);

export const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = BCRYPT_SALT_ROUNDS >= 10 ? BCRYPT_SALT_ROUNDS : 10;
  const hashedPassword = await bcrypt.hash(password, saltRounds);
  return hashedPassword;
};

export const comparePassword = async (
  password: string,
  hashedPassword: string
): Promise<boolean> => {
  const isMatch = await bcrypt.compare(password, hashedPassword);
  return isMatch;
};

export const generateToken = (userId: string, email: string): string => {
  const payload: Omit<JwtPayload, "iat" | "exp"> = {
    userId,
    email,
  };
  if (!JWT_SECRET) {
    throw new Error("JWT_SECRET is not set");
  }
  // JWT_EXPIRES_IN is a string like "24h" which is valid for jwt.sign
  const token = jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  } as jwt.SignOptions);
  return token;
};

export const verifyToken = (token: string): JwtPayload => {
  try {
    if (!JWT_SECRET) {
      throw new Error("JWT_SECRET is not set");
    }
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    return decoded;
  } catch (error) {
    throw new Error("Invalid or expired token");
  }
};
