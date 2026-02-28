import { Request, Response } from "express";
import { QueryTypes } from "sequelize";
import sequelize from "../config/database";
import { hashPassword, comparePassword, generateToken } from "../services/authService";
import { RegisterInput, LoginInput } from "../validators/authValidator";

interface UserAttributes {
  id: string;
  username: string;
  email: string;
  password: string;
}

export const register = async (
  req: Request<unknown, unknown, RegisterInput>,
  res: Response
): Promise<void> => {
  try {
    const { username, email, password } = req.body;

    const existingUserQuery = `
      SELECT id FROM users 
      WHERE email = :email OR username = :username 
      LIMIT 1
    `;
    const existingUsers = await sequelize.query(existingUserQuery, {
      replacements: { email, username },
      type: QueryTypes.SELECT,
    });

    if (Array.isArray(existingUsers) && existingUsers.length > 0) {
      res.status(400).json({
        success: false,
        message: "User with this email or username already exists",
      });
      return;
    }

    const hashedPassword = await hashPassword(password);

    const insertQuery = `
      INSERT INTO users (id, username, email, password, "createdAt", "updatedAt")
      VALUES (gen_random_uuid(), :username, :email, :password, NOW(), NOW())
      RETURNING id, username, email
    `;
    const [user] = await sequelize.query(insertQuery, {
      replacements: {
        username,
        email,
        password: hashedPassword,
      },
      type: QueryTypes.SELECT,
    }) as UserAttributes[];

    const token = generateToken(user.id, user.email);

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: {
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const login = async (
  req: Request<unknown, unknown, LoginInput>,
  res: Response
): Promise<void> => {
  try {
    const { email, password } = req.body;

    const userQuery = `
      SELECT id, username, email, password 
      FROM users 
      WHERE email = :email 
      LIMIT 1
    `;
    const users = await sequelize.query(userQuery, {
      replacements: { email },
      type: QueryTypes.SELECT,
    }) as UserAttributes[];

    if (!Array.isArray(users) || users.length === 0) {
      res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
      return;
    }

    const user = users[0];

    const isPasswordValid = await comparePassword(password, user.password);

    if (!isPasswordValid) {
      res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
      return;
    }

    const token = generateToken(user.id, user.email);

    res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
