import { Request, Response, NextFunction } from "express";
import { QueryTypes } from "sequelize";
import sequelize from "../config/database";
import { verifyToken } from "../services/authService";
import { UserAttributes } from "../types/models";
import { UnauthorizedError } from "../utils/errors";

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new UnauthorizedError("Authentication required");
    }

    const token = authHeader.substring(7);

    try {
      const decoded = verifyToken(token);
      const userQuery = `
        SELECT id, username, email, password, "createdAt", "updatedAt"
        FROM users
        WHERE id = :userId
        LIMIT 1
      `;
      const users = (await sequelize.query(userQuery, {
        replacements: { userId: decoded.userId },
        type: QueryTypes.SELECT,
      })) as UserAttributes[];

      if (!Array.isArray(users) || users.length === 0) {
        throw new UnauthorizedError("User not found");
      }

      const user = users[0];
      // Remove password from user object
      const { password, ...userWithoutPassword } = user;
      req.user = userWithoutPassword;
      next();
    } catch (error) {
      if (error instanceof UnauthorizedError) {
        res.status(error.statusCode).json({
          success: false,
          message: error.message,
        });
        return;
      }
      res.status(401).json({
        success: false,
        message: "Invalid or expired token",
      });
      return;
    }
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
      return;
    }
    next(error);
  }
};
