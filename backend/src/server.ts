import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import compression from "compression";
import { connectDatabase } from "./config/database";
import config from "./config/env";
import { AppError } from "./utils/errors";
import authRoutes from "./routes/auth";
import movieRoutes from "./routes/movies";
import reviewRoutes from "./routes/reviews";

const app = express();

app.use(
  cors({
    origin: config.CORS_ORIGIN,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json({ limit: config.BODY_LIMIT }));
app.use(express.urlencoded({ extended: true, limit: config.BODY_LIMIT }));

app.use(compression());

app.use("/api/auth", authRoutes);
app.use("/api/movies", movieRoutes);
app.use("/api/reviews", reviewRoutes);

// Health check
app.get("/health", (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "Server is running",
  });
});

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
    return;
  }

  console.error("Unexpected error:", err);
  res.status(500).json({
    success: false,
    message:
      config.NODE_ENV === "development" ? err.message : "Internal server error",
  });
});

// 404 handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// Start server
const startServer = async (): Promise<void> => {
  try {
    await connectDatabase();
    app.listen(config.PORT, () => {
      console.log(`Server is running on port ${config.PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

if (config.NODE_ENV !== "test" && !process.env.JEST_WORKER_ID) {
  startServer();
}

export default app;
