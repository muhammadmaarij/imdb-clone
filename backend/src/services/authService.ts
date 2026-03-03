import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import config from "../config/env";
import { JwtPayload } from "../types/auth";

export const hashPassword = async (password: string): Promise<string> => {
  const saltRounds =
    config.BCRYPT_SALT_ROUNDS >= 10 ? config.BCRYPT_SALT_ROUNDS : 10;
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

export const generateToken = (
  userId: string,
  email: string,
  username?: string
): string => {
  const payload: Omit<JwtPayload, "iat" | "exp"> = {
    userId,
    email,
    ...(username && { username }),
  };

  if (!config.JWT_SECRET) {
    throw new Error("JWT_SECRET is not set");
  }

  const token = jwt.sign(payload, config.JWT_SECRET, {
    expiresIn: config.JWT_EXPIRES_IN,
  } as jwt.SignOptions);
  return token;
};

export const verifyToken = (token: string): JwtPayload => {
  try {
    if (!config.JWT_SECRET) {
      throw new Error("JWT_SECRET is not set");
    }
    const decoded = jwt.verify(token, config.JWT_SECRET) as JwtPayload;
    return decoded;
  } catch (error) {
    throw new Error("Invalid or expired token");
  }
};
